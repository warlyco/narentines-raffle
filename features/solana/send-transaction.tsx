import { useMutation } from "@apollo/client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import { ADD_RAFFLE_ENTRY } from "graphql/mutations/add-raffle-entry";
import { useCallback } from "react";

const { NEXT_PUBLIC_COLLECTION_WALLET } = process.env;

type Props = {
  raffleId: string;
  newCount: number;
};

export const SendTransaction = ({ raffleId, newCount }: Props) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [addRaffleEntry, { data, loading, error }] =
    useMutation(ADD_RAFFLE_ENTRY);

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

      await connection.confirmTransaction(signature, "processed");
      console.log("success", "Transaction successful!", signature);
      addRaffleEntry({
        variables: {
          walletAddress: publicKey.toString(),
          count: newCount,
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
    addRaffleEntry,
    newCount,
    raffleId,
  ]);

  return (
    <button
      onClick={onClick}
      disabled={!publicKey}
      className="w-full py-3 bg-red-600 text-amber-200 uppercase rounded-lg"
    >
      {loading ? "Submitting..." : "Join Raffle"}
    </button>
  );
};
