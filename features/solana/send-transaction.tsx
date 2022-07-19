import { useMutation } from "@apollo/client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import { GET_ENTRIES_COUNT } from "graphql/queries/get-entries-count";
import { ADD_RAFFLE_ENTRY } from "graphql/mutations/add-raffle-entry";
import { SetStateAction, useCallback } from "react";
import toast from "react-hot-toast";
import classNames from "classnames";
import { Action, Dispatch } from "redux";
import { Raffle } from "types";
import { TOKEN_PROGRAM_ID, createTransferInstruction } from "@solana/spl-token";

const { NEXT_PUBLIC_COLLECTION_WALLET } = process.env;

type Props = {
  raffle: Raffle;
  entryCount: number;
  numberOfTicketsToBuy: string;
  setNumberOfTicketsToBuy: any;
  raffleIsOver: boolean;
};

export const SendTransaction = ({
  raffle,
  entryCount,
  numberOfTicketsToBuy,
  setNumberOfTicketsToBuy,
  raffleIsOver,
}: Props) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [addRaffleEntry, { data, loading, error }] = useMutation(
    ADD_RAFFLE_ENTRY,
    {
      refetchQueries: [
        {
          query: GET_ENTRIES_COUNT,
          variables: {
            raffleId: raffle.id,
            walletAddress: publicKey?.toString(),
          },
        },
      ],
    }
  );

  const onClick = useCallback(async () => {
    if (!publicKey || !NEXT_PUBLIC_COLLECTION_WALLET) {
      console.log("error", "Wallet not connected!");
      return;
    }

    let signature: TransactionSignature = "";
    try {
      // SOL
      const solInLamports =
        (LAMPORTS_PER_SOL / 100) * Number(numberOfTicketsToBuy);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(NEXT_PUBLIC_COLLECTION_WALLET),
          lamports: solInLamports,
        })
      );

      // SPL TOKEN
      // const transaction = new Transaction().add(
      //   createTransferInstruction(
      //     publicKey,
      //     new PublicKey(NEXT_PUBLIC_COLLECTION_WALLET),
      //     publicKey,
      //     Number(numberOfTicketsToBuy),
      //     [],
      //     TOKEN_PROGRAM_ID
      //   )
      // );

      signature = await sendTransaction(transaction, connection);
      console.log("info", "Transaction sent:", signature);
      toast.custom(
        <div className="flex bg-white rounded-xl shadow-lg p-3 border-slate-400">
          <div>Transaction sent...</div>
        </div>
      );

      await connection.confirmTransaction(signature, "processed");
      console.log("success", "Transaction successful!", signature);
      toast.custom(
        <div className="flex bg-white rounded-xl shadow-xl p-3 border-slate-400">
          <div>Transaction successful!</div>
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline block ml-2"
          >
            Inspect
          </a>
        </div>
      );

      addRaffleEntry({
        variables: {
          walletAddress: publicKey.toString(),
          count: entryCount + Number(numberOfTicketsToBuy),
          soldTicketCount:
            raffle.soldTicketCount + Number(numberOfTicketsToBuy),
          raffleId: raffle.id,
        },
      });
    } catch (error: any) {
      console.log("error", `Transaction failed! ${error?.message}`, signature);
      return;
    } finally {
      setNumberOfTicketsToBuy(0);
    }
  }, [
    publicKey,
    numberOfTicketsToBuy,
    sendTransaction,
    connection,
    addRaffleEntry,
    entryCount,
    raffle.soldTicketCount,
    raffle.id,
    setNumberOfTicketsToBuy,
  ]);

  const getButtonText = () => {
    if (raffleIsOver) return "Raffle is over";
    if (loading) return "Submitting...";
    if (
      Number(numberOfTicketsToBuy) >=
      raffle.totalTicketCount - raffle.soldTicketCount
    )
      return "Sold Out";

    return "Buy tickets";
  };

  return (
    <button
      onClick={onClick}
      disabled={
        raffleIsOver ||
        !publicKey ||
        loading ||
        Number(numberOfTicketsToBuy) <= 0 ||
        Number(numberOfTicketsToBuy) >
          raffle.totalTicketCount - raffle.soldTicketCount
      }
      className={classNames({
        "w-full py-3 uppercase rounded-lg": true,
        "bg-red-600 text-amber-200": !raffleIsOver,
        "border border-green-800 text-green-800": raffleIsOver,
        "opacity-80 cursor-not-allowed":
          raffleIsOver ||
          !publicKey ||
          loading ||
          Number(numberOfTicketsToBuy) <= 0 ||
          Number(numberOfTicketsToBuy) >
            raffle.totalTicketCount - raffle.soldTicketCount,
      })}
    >
      {getButtonText()}
    </button>
  );
};
