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
import { useCallback } from "react";
import toast from "react-hot-toast";
import classNames from "classnames";

const { NEXT_PUBLIC_COLLECTION_WALLET } = process.env;

type Props = {
  raffleId: string;
  newCount: number;
  newSoldTicketCount: number;
  raffleIsOver: boolean;
};

export const SendTransaction = ({
  raffleId,
  newCount,
  newSoldTicketCount,
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
          variables: { raffleId, walletAddress: publicKey?.toString() },
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
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(NEXT_PUBLIC_COLLECTION_WALLET),
          lamports: LAMPORTS_PER_SOL / 100,
        })
      );

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
          count: newCount,
          soldTicketCount: newSoldTicketCount,
          raffleId,
        },
      });
    } catch (error: any) {
      console.log("error", `Transaction failed! ${error?.message}`, signature);
      return;
    }
  }, [
    publicKey,
    sendTransaction,
    connection,
    newSoldTicketCount,
    addRaffleEntry,
    newCount,
    raffleId,
  ]);

  return (
    <button
      onClick={onClick}
      disabled={raffleIsOver || !publicKey || loading}
      className={classNames({
        "w-full py-3 bg-red-600 text-amber-200 uppercase rounded-lg": true,
        "opacity-50 cursor-not-allowed": raffleIsOver || !publicKey || loading,
      })}
    >
      {raffleIsOver && "Raffle is over"}
      {loading && "Submitting..."}
      {!loading && !raffleIsOver && "Buy tickets"}
    </button>
  );
};
