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
import { Raffle, RaffleEntryResponse, SplTokens } from "types/types";
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
  checkIfPurchaseIsAllowed,
  createSolanaTransaction,
  getTokenMintAddress,
} from "features/solana/helpers";
import base58 from "bs58";
import { E001, E002, E003, E004, E005, E006, E007 } from "errors/types";
import showTransactionSuccessToast from "features/toasts/show-transaction-success-toast";
import showGenericErrorToast from "features/toasts/show-generic-error-toast";
import showCouldNotConfirmTransactionToast from "features/toasts/show-could-not-confirm-transaction-toast";

const SwalReact = withReactContent(Swal);

type Props = {
  raffle: Raffle;
  entryCount: number;
  numberOfTicketsToBuy: number;
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

  // const handleRollbackPurchase = useCallback(
  //   async (
  //     entryId: string,
  //     primaryMessage: string,
  //     secondaryMessage: string = "Please try again."
  //   ) => {
  //     let res;
  //     try {
  //       res = await axios.post(UPDATE_ENTRY_COUNT, {
  //         id: entryId,
  //         count: entryCount,
  //       });
  //     } catch (error) {
  //       console.error(
  //         `Failed to rollback purchase: ${(error as Error).message}`
  //       );
  //       return;
  //     }

  //     showToast({ primaryMessage, secondaryMessage });
  //   },
  //   [entryCount]
  // );

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
        const signedTransaction = await signTransaction(transaction);
        const { signature: txSignature } = signedTransaction.signatures?.[0];

        if (!txSignature) return;

        const txSig = base58.encode(txSignature);
        let signature;

        try {
          signature = await connection.sendRawTransaction(
            signedTransaction.serialize()
          );
        } catch (error) {
          showGenericErrorToast(E001);
          return;
        }

        if (!signature) {
          showGenericErrorToast(E002);
          return;
        }

        try {
          await connection.confirmTransaction({
            signature,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            blockhash: latestBlockHash.blockhash,
          });
        } catch (error) {
          showCouldNotConfirmTransactionToast({ signature, error: E003 });
          return;
        }

        let raffleEntryData: RaffleEntryResponse | null;
        try {
          const { data } = await axios.post<RaffleEntryResponse>(
            ADD_RAFFLE_ENTRY,
            {
              walletAddress: fromPublicKey.toString(),
              oldCount: entryCount,
              newCount: numberOfTicketsToBuy,
              raffleId: raffle.id,
              isVerified: false,
              transactionSignature: txSig,
              paymentMethod,
            }
          );
          raffleEntryData = data;
        } catch (error) {
          showCouldNotConfirmTransactionToast({ signature, error: E004 });
          return;
        }

        if (!raffleEntryData) {
          showCouldNotConfirmTransactionToast({ signature, error: E005 });
        }

        // TODO: Add new tx to own db table
        try {
          const { id } = raffleEntryData;
          await axios.post(UPDATE_ENTRY_SIGNATURE, {
            id,
            txSignature: signature,
          });
        } catch (error) {
          showCouldNotConfirmTransactionToast({ signature, error: E006 });
          return;
        }

        showTransactionSuccessToast(signature);
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
      signMessage,
      handleUpdateCounts,
      connection,
      entryCount,
      numberOfTicketsToBuy,
      raffle.id,
      paymentMethod,
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
        numberOfTicketsToBuy: numberOfTicketsToBuy,
        pricePerTicket: raffle.priceInSol,
      });

      const latestBlockHash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockHash.blockhash;
      transaction.feePayer = fromPublicKey;

      handleSendTransaction({ transaction, latestBlockHash });
    } catch (error) {
      showGenericErrorToast(E007);
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
          return numberOfTicketsToBuy * raffle.priceInGoods;
        case SplTokens.SOL:
          return numberOfTicketsToBuy * raffle.priceInSol;
        case SplTokens.DUST:
          return numberOfTicketsToBuy * raffle.priceInDust * 10000000;
        case SplTokens.FORGE:
          return numberOfTicketsToBuy * raffle.priceInForge * 10000000;
        case SplTokens.GEAR:
          return numberOfTicketsToBuy * raffle.priceInGear * 10000000;
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
      isAllowed = await checkIfPurchaseIsAllowed(raffle, numberOfTicketsToBuy);
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
    if (numberOfTicketsToBuy > raffle.totalTicketCount - raffle.soldTicketCount)
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
            numberOfTicketsToBuy % 1 !== 0 ||
            numberOfTicketsToBuy <= 0 ||
            numberOfTicketsToBuy >
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
              numberOfTicketsToBuy <= 0 ||
              numberOfTicketsToBuy >
                raffle.totalTicketCount - raffle.soldTicketCount,
          })}
        >
          {getButtonText()}
        </button>
      )}
    </>
  );
};
