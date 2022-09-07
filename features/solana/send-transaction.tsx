import {
  isProduction,
  MINT_ADDRESSES,
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
import {
  ADD_RAFFLE_ENTRY,
  UPDATE_ENTRY_COUNT,
  UPDATE_ENTRY_SIGNATURE,
} from "api/raffles/endpoints";
import {
  createSolanaTransaction,
  getTokenMintAddress,
} from "features/solana/helpers";
import client from "graphql/apollo-client";
import { GET_RAFFLES } from "graphql/queries/get-raffles";
import { GET_TEST_RAFFLES } from "graphql/queries/get-test-raffles";
import base58 from "bs58";
import VERIFY_RAFFLE_ENTRY from "graphql/mutations/verify-raffle-entry";
import nacl from "tweetnacl";

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
    signMessage,
  } = useWallet();

  const handleRollbackPurchase = useCallback(
    async (
      entryId: string,
      message1: string,
      message2: string = "Please try again."
    ) => {
      let res;
      try {
        res = await axios.post(UPDATE_ENTRY_COUNT, {
          id: entryId,
          count: entryCount,
        });
      } catch (error) {
        console.error(
          `Failed to rollback purchase: ${(error as Error).message}`
        );
        return;
      }

      toast.custom(
        <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
          <div>{message1}</div>
          <div>{message2}</div>
        </div>
      );
    },
    [entryCount]
  );

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
      if (!signTransaction || !fromPublicKey || !signMessage) return;
      try {
        const ticketsPlural =
          Number(numberOfTicketsToBuy) > 1 ? "tickets" : "ticket";
        const message = `Buying ${Number(
          numberOfTicketsToBuy
        )} raffle ${ticketsPlural}`;
        const messageSignature = await signMessage(
          new TextEncoder().encode(message)
        );
        const signedTransaction = await signTransaction(transaction);
        // console.log(signedTransaction);
        const { signature: txSignature } = signedTransaction.signatures?.[0];
        // const txSig = "";
        // const txSig = base58.decode(txSignature.buffer);
        if (!txSignature) return;
        const txSig = base58.encode(txSignature);
        console.log(txSig, txSignature);

        let signature;
        try {
          signature = await connection.sendRawTransaction(
            signedTransaction.serialize()
          );
        } catch (error) {
          console.error(
            `Could not send transaction: ${(error as Error).message}`
          );
          return;
        }

        if (!signature) {
          toast("Unkown error - Please open a support ticket in discord");
          console.error("Tx signature missing");
          return;
        }

        try {
          await connection.confirmTransaction({
            signature,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            blockhash: latestBlockHash.blockhash,
          });
        } catch (error) {
          toast.custom(
            <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
              <div>Your purchase could not be confirmed.</div>
              <div>Please open a support ticket in discord for assistance.</div>
            </div>
          );
          console.error(
            `Could not confirm transaction: ${(error as Error).message}`
          );
          return;
        }

        let raffleEntryData: RaffleEntryResponse | null;
        try {
          const { data } = await axios.post<RaffleEntryResponse>(
            ADD_RAFFLE_ENTRY,
            {
              walletAddress: fromPublicKey.toString(),
              oldCount: entryCount,
              newCount: Number(numberOfTicketsToBuy),
              raffleId: raffle.id,
              isVerified: false,
              transaction,
              transactionSignature: txSig,
              signature: JSON.stringify(messageSignature),
              publicKey: JSON.stringify(fromPublicKey.toBytes()),
              message,
              paymentMethod,
            }
          );
          raffleEntryData = data;
        } catch (error) {
          toast.custom(
            <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
              <div>Your purchase could not be confirmed.</div>
              <div>Please open a support ticket in discord for assistance.</div>
            </div>
          );
          return;
        }

        if (!raffleEntryData) {
          toast.custom(
            <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
              <div>Your purchase could not be confirmed.</div>
              <div>Please open a support ticket in discord for assistance.</div>
            </div>
          );
          toast("There was a problem. Please try again.");
          throw new Error("Could not save raffle entry");
        }

        const { updatedCount, id } = raffleEntryData;

        try {
          const res = await axios.post(UPDATE_ENTRY_SIGNATURE, {
            id,
            txSignature: signature,
          });
        } catch (error) {
          toast("Unkown error - Please open a support ticket in discord");
          console.error(`Update signature failed: ${(error as Error).message}`);
          return;
        }

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

        let verificationData;
        try {
          const { data } = await client.mutate({
            mutation: VERIFY_RAFFLE_ENTRY,
            variables: {
              id,
            },
          });
          verificationData = data;
        } catch (error) {
          handleRollbackPurchase(
            id,
            "Your purchase could not be confirmed.",
            "Please open a support ticket in discord for assistance."
          );
          return;
        }

        const { update_entries } = verificationData;

        if (!updatedCount || !update_entries?.returning?.[0]) {
          handleRollbackPurchase(
            id,
            "Your purchase could not be confirmed.",
            "Please open a support ticket in discord for assistance."
          );
        }

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
        console.error(
          `Error in handleSendTransaction: ${(error as Error).message}`
        );
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
      handleRollbackPurchase,
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
      console.error(`Could not send transaction: ${(error as Error).message}`);
      return;
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
        case SplTokens.FORGE:
          return Number(numberOfTicketsToBuy) * raffle.priceInForge * 10000000;
        case SplTokens.GEAR:
          return Number(numberOfTicketsToBuy) * raffle.priceInGear * 10000000;
      }
    },
    [
      numberOfTicketsToBuy,
      raffle.priceInDust,
      raffle.priceInForge,
      raffle.priceInGear,
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
    axios.post(UPDATE_ENTRY_COUNT, { noop: true });
    setIsLoading(true);
    setIsSendingTransaction(true);

    let isAllowed;
    try {
      isAllowed = await checkIfPurchaseIsAllowed();
    } catch (error) {
      console.error(`Purchase not allowed: ${(error as Error).message}`);
    }
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
