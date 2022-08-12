import {
  isProduction,
  RPC_ENDPOINT,
  SOLANA_CLUSTER,
} from "constants/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  BlockhashWithExpiryBlockHeight,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import classNames from "classnames";
import {
  Raffle,
  RaffleEntryResponse,
  RafflesResponse,
  SplTokens,
} from "types/types";
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";
import axios from "axios";
import { ADD_RAFFLE_ENTRY } from "api/raffles/endpoints";
import {
  createSolanaTransaction,
  getTokenMintAddress,
} from "features/solana/helpers";
import client from "graphql/apollo-client";
import { GET_RAFFLES } from "graphql/queries/get-raffles";
import { GET_TEST_RAFFLES } from "graphql/queries/get-test-raffles";

import VERIFY_RAFFLE_ENTRY from "graphql/mutations/verify-raffle-entry";
import Overlay from "features/overlay";

const SwalReact = withReactContent(Swal);

type Props = {
  raffle: Raffle;
  entryCount: number;
  numberOfTicketsToBuy: string;
  raffleIsOver: boolean;
  raffleIsSoldOut: boolean;
  winner?: string;
  winners: string[];
  handleUpdateCounts: () => void;
  handleCompleteTransaction: () => void;
  setIsSendingTransaction: (isSendingTransaction: boolean) => void;
  paymentMethod: SplTokens | null;
};

export const SendTransaction = ({
  raffle,
  entryCount,
  numberOfTicketsToBuy,
  raffleIsOver,
  raffleIsSoldOut,
  winner,
  winners,
  handleUpdateCounts,
  handleCompleteTransaction,
  setIsSendingTransaction,
  paymentMethod,
}: Props) => {
  const { connection } = useConnection();

  const [isLoading, setIsLoading] = useState(false);
  const {
    publicKey: fromPublicKey,
    sendTransaction,
    signTransaction,
  } = useWallet();

  const checkIfPurchaseIsAllowed = async () => {
    return new Promise(async (resolve, reject) => {
      const query = isProduction ? GET_RAFFLES : GET_TEST_RAFFLES;

      const { data } = await client.query({
        query,
        fetchPolicy: "no-cache",
      });

      const updatedRaffle = data.raffles.find(
        ({ id }: Raffle) => id === raffle.id
      );

      if (!updatedRaffle) {
        toast("Unkown raffle");
        reject("Unkown raffle");
        throw new Error("Unkown raffle");
      }

      const { totalTicketCount, soldTicketCount } = updatedRaffle;
      if (totalTicketCount - soldTicketCount <= 0) {
        toast("Raffle is sold out!");
        reject("Raffle is sold out!");
        throw new Error("Raffle is sold out!");
      }
      if (totalTicketCount - soldTicketCount < Number(numberOfTicketsToBuy)) {
        toast("Not enough tickets left");
        reject("Not enough tickets left");
        throw new Error("Not enough tickets left");
      }

      resolve(true);
    });
  };

  const handleSendTransaction = useCallback(
    async ({
      transaction,
      latestBlockHash,
    }: {
      transaction: Transaction;
      latestBlockHash: BlockhashWithExpiryBlockHeight;
    }) => {
      if (!signTransaction || !fromPublicKey) return;
      try {
        const signed = await signTransaction(transaction);

        const signature = await connection.sendRawTransaction(
          signed.serialize()
        );

        const { data: raffleEntryData } = await axios.post<RaffleEntryResponse>(
          ADD_RAFFLE_ENTRY,
          {
            txSignature: signature,
            walletAddress: fromPublicKey.toString(),
            oldCount: entryCount,
            newCount: Number(numberOfTicketsToBuy),
            raffleId: raffle.id,
            isVerified: false,
          }
        );

        toast.custom(
          <div className="flex bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
            <div>Transaction sent...</div>
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_CLUSTER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline block ml-2"
            >
              View
            </a>
          </div>
        );

        await connection.confirmTransaction({
          signature,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          blockhash: latestBlockHash.blockhash,
        });

        const { updatedCount, id } = raffleEntryData;

        const { data: verificationData } = await client.mutate({
          mutation: VERIFY_RAFFLE_ENTRY,
          variables: {
            id,
          },
        });

        const { update_entries } = verificationData;

        if (!updatedCount || !update_entries?.returning?.[0]) {
          toast("Unkown error - Please open a support ticket in discord");
          throw new Error("Unkown error");
        }

        // verify entry

        toast.custom(
          <div className="flex bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
            <div>Transaction successful!</div>
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_CLUSTER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline block ml-2"
            >
              View
            </a>
          </div>
        );
        handleUpdateCounts();
      } catch (error) {
        console.error("error", error);
      } finally {
        setIsLoading(false);
        setIsSendingTransaction(false);
        handleCompleteTransaction();
      }
    },
    [
      signTransaction,
      fromPublicKey,
      connection,
      entryCount,
      numberOfTicketsToBuy,
      raffle.id,
      handleUpdateCounts,
      setIsSendingTransaction,
      handleCompleteTransaction,
    ]
  );

  const handleSolPayment = useCallback(async () => {
    if (!fromPublicKey || !sendTransaction || !signTransaction) {
      console.log("error", "Wallet not connected!");
      return;
    }

    if (!process.env.NEXT_PUBLIC_COLLECTION_WALLET) {
      console.log("error", "No collection wallet set!");
      return;
    }
    try {
      const transaction = createSolanaTransaction({
        fromPublicKey,
        toPublicKey: new PublicKey(process.env.NEXT_PUBLIC_COLLECTION_WALLET),
        numberOfTicketsToBuy: Number(numberOfTicketsToBuy),
        pricePerTicket: raffle.priceInSol,
      });

      const latestBlockHash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockHash.blockhash;
      transaction.feePayer = fromPublicKey;

      handleSendTransaction({ transaction, latestBlockHash });
    } catch (error) {
      console.log("error", error);
    }
  }, [
    connection,
    fromPublicKey,
    handleSendTransaction,
    numberOfTicketsToBuy,
    raffle.priceInSol,
    sendTransaction,
    signTransaction,
  ]);

  const getAmount = useCallback(
    (token: SplTokens) => {
      switch (token) {
        case SplTokens.GOODS:
          return Number(numberOfTicketsToBuy) * raffle.priceInGoods;
        case SplTokens.SOL:
          return Number(numberOfTicketsToBuy) * raffle.priceInSol;
        case SplTokens.DUST:
          return Number(numberOfTicketsToBuy) * raffle.priceInDust * 10000000;
      }
    },
    [
      numberOfTicketsToBuy,
      raffle.priceInDust,
      raffle.priceInGoods,
      raffle.priceInSol,
    ]
  );

  const handleSplPayment = useCallback(
    async ({ token }: { token: SplTokens }) => {
      if (!fromPublicKey || !sendTransaction || !signTransaction) {
        console.log("error", "Wallet not connected!");
        return;
      }

      if (
        !process.env.NEXT_PUBLIC_COLLECTION_WALLET ||
        !process.env.NEXT_PUBLIC_GOODS_TOKEN_MINT_ADDRESS
      ) {
        console.log("error", "Missing environment variables!");
        return;
      }

      try {
        const toAddress = process.env.NEXT_PUBLIC_COLLECTION_WALLET;
        const toPublicKey = new PublicKey(toAddress);
        const amount = getAmount(token);
        const mintAddress = getTokenMintAddress(token);
        const tokenPublicKey = new PublicKey(mintAddress!);

        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          // @ts-ignore
          fromPublicKey,
          tokenPublicKey,
          fromPublicKey,
          signTransaction
        );

        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          // @ts-ignore
          fromPublicKey,
          tokenPublicKey,
          toPublicKey,
          signTransaction
        );

        const transaction = new Transaction().add(
          createTransferInstruction(
            fromTokenAccount.address,
            toTokenAccount.address,
            fromPublicKey,
            amount * 100, // tokens have 6 decimals of precision so your amount needs to have the same
            [],
            TOKEN_PROGRAM_ID
          )
        );

        const latestBlockHash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockHash.blockhash;

        transaction.feePayer = fromPublicKey;
        handleSendTransaction({ transaction, latestBlockHash });
      } catch (error: any) {
        setIsLoading(false);
        setIsSendingTransaction(false);
        if (
          error instanceof TokenAccountNotFoundError ||
          error instanceof TokenInvalidAccountOwnerError
        ) {
          toast.custom(
            <div className="flex bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
              Transaction failed. You must have the selected currency to buy a
              ticket.
            </div>
          );
        } else {
          toast.custom(
            <div className="flex bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
              Transaction failed. Make sure you have enough SOL for for the
              transaction.
            </div>
          );
          console.error(error);
        }
        return;
      }
    },
    [
      fromPublicKey,
      sendTransaction,
      signTransaction,
      getAmount,
      connection,
      handleSendTransaction,
      setIsSendingTransaction,
    ]
  );

  const handlePayment = async () => {
    if (!paymentMethod) return;
    setIsLoading(true);
    setIsSendingTransaction(true);
    const isAllowed = await checkIfPurchaseIsAllowed();
    if (!isAllowed) return;

    if (paymentMethod === SplTokens.SOL) {
      handleSolPayment();
    } else {
      handleSplPayment({ token: paymentMethod });
    }
  };

  const displayWinners = () => {
    SwalReact.fire({
      title: `${raffle.name} Winners!`,
      html: (
        <div>
          {winners.map((winner, i) => {
            return (
              <div className="truncate" key={i}>
                {winner}
              </div>
            );
          })}
        </div>
      ),
      confirmButtonText: "Close",
    });
  };

  const getButtonText = () => {
    if (winner) return `Winner: ${winner}`;
    if (raffleIsOver) return "Raffle is over";
    if (!fromPublicKey) return "Connect wallet to buy";
    if (isLoading)
      return (
        <div>
          Submitting...
          {/* <Spinner /> */}
        </div>
      );
    if (raffleIsSoldOut) return "Sold Out";
    if (
      Number(numberOfTicketsToBuy) >
      raffle.totalTicketCount - raffle.soldTicketCount
    )
      return "Not enough tickets";

    return "Buy tickets";
  };

  return (
    <>
      {winners?.length ? (
        <button
          className="border-2 border-green-800 text-green-800 truncate w-full py-3 uppercase rounded-lg px-2 font-bold text-xl pt-4"
          onClick={displayWinners}
        >
          See All Winners
        </button>
      ) : (
        <button
          onClick={handlePayment}
          disabled={
            !paymentMethod ||
            raffleIsOver ||
            !fromPublicKey ||
            isLoading ||
            Number(numberOfTicketsToBuy) % 1 !== 0 ||
            Number(numberOfTicketsToBuy) <= 0 ||
            Number(numberOfTicketsToBuy) >
              raffle.totalTicketCount - raffle.soldTicketCount
          }
          className={classNames({
            "truncate w-full py-3 uppercase rounded-lg px-2 font-bold text-xl pt-4":
              true,
            "bg-red-600 text-amber-200":
              !raffleIsOver && !winner && !winners?.length,
            "border-2 border-green-800 text-green-800":
              raffleIsOver || winner || winners?.length,
            "opacity-80 cursor-not-allowed":
              raffleIsOver ||
              !fromPublicKey ||
              isLoading ||
              Number(numberOfTicketsToBuy) <= 0 ||
              Number(numberOfTicketsToBuy) >
                raffle.totalTicketCount - raffle.soldTicketCount,
          })}
        >
          {getButtonText()}
        </button>
      )}
    </>
  );
};
