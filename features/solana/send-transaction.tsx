import { RPC_ENDPOINT, SOLANA_CLUSTER } from "constants/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import GET_ENTRIES_BY_WALLET from "graphql/queries/get-entries-by-wallet";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import classNames from "classnames";
import {
  Raffle,
  RaffleEntryResponse,
  RaffleResponse,
  RafflesResponse,
} from "types/types";
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";
import axios from "axios";
import { GET_RAFFLES, ADD_RAFFLE_ENTRY } from "api/raffles/endpoints";

type Props = {
  raffle: Raffle;
  entryCount: number;
  numberOfTicketsToBuy: string;
  setNumberOfTicketsToBuy: any;
  handleUpdateCounts: any;
  raffleIsOver: boolean;
};

export const SendTransaction = ({
  raffle,
  entryCount,
  numberOfTicketsToBuy,
  setNumberOfTicketsToBuy,
  raffleIsOver,
  handleUpdateCounts,
}: Props) => {
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const {
    publicKey: fromPublicKey,
    sendTransaction,
    signTransaction,
  } = useWallet();

  const onClick = useCallback(async () => {
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
      const amount = Number(numberOfTicketsToBuy) * raffle.priceInGoods;

      const tokenPublicKey = new PublicKey(
        process.env.NEXT_PUBLIC_GOODS_TOKEN_MINT_ADDRESS
      );

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

      const signed = await signTransaction(transaction);

      const { data } = await axios.get<RaffleResponse>(
        `${GET_RAFFLES}?id=${raffle.id}`
      );
      if (!data.raffle) {
        toast("Unkown raffle");
        throw new Error("Unkown raffle");
      }
      const { raffle: updatedRaffle } = data;

      const { totalTicketCount, soldTicketCount } = updatedRaffle;
      if (totalTicketCount - soldTicketCount <= 0) {
        toast("Raffle is sold out!");
        throw new Error("Raffle is sold out!");
      }
      if (totalTicketCount - soldTicketCount < Number(numberOfTicketsToBuy)) {
        toast("Not enough tickets left");
        throw new Error("Not enough tickets left");
      }

      const signature = await connection.sendRawTransaction(signed.serialize());

      toast.custom(
        <div className="flex bg-white rounded-xl shadow-lg p-3 border-slate-400">
          <div>Transaction sent...</div>
        </div>
      );

      await connection.confirmTransaction({
        signature,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        blockhash: latestBlockHash.blockhash,
      });
      console.log("success", "Transaction successful!", signature);

      const { data: raffleEntryData } = await axios.post<RaffleEntryResponse>(
        ADD_RAFFLE_ENTRY,
        {
          walletAddress: fromPublicKey.toString(),
          count: entryCount + Number(numberOfTicketsToBuy),
          soldTicketCount:
            raffle.soldTicketCount + Number(numberOfTicketsToBuy),
          raffleId: raffle.id,
        }
      );

      const { updatedCount } = raffleEntryData;

      if (!updatedCount) {
        toast("Unkown error - Please open a support ticket in discord");
        throw new Error("Unkown error");
      }

      toast.custom(
        <div className="flex bg-white rounded-xl shadow-xl p-3 border-slate-400">
          <div>Transaction successful!</div>
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_CLUSTER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline block ml-2"
          >
            Inspect
          </a>
        </div>
      );

      handleUpdateCounts(updatedCount);
    } catch (error: any) {
      console.log("error", `Transaction failed! ${error?.message}`);
      if (
        error instanceof TokenAccountNotFoundError ||
        error instanceof TokenInvalidAccountOwnerError
      ) {
        toast.custom(
          <div className="flex bg-white rounded-xl shadow-lg p-3 border-slate-400 text-center">
            Transaction failed. You must have $GOODS to buy a ticket.
          </div>
        );
      }
      return;
    } finally {
      setNumberOfTicketsToBuy(0);
    }
  }, [
    fromPublicKey,
    sendTransaction,
    signTransaction,
    numberOfTicketsToBuy,
    raffle.priceInGoods,
    raffle.id,
    raffle.soldTicketCount,
    connection,
    entryCount,
    handleUpdateCounts,
    setNumberOfTicketsToBuy,
  ]);

  const getButtonText = () => {
    if (raffleIsOver) return "Raffle is over";
    if (isLoading) return "Submitting...";
    if (raffle.totalTicketCount <= raffle.soldTicketCount) return "Sold Out";
    if (
      Number(numberOfTicketsToBuy) >
      raffle.totalTicketCount - raffle.soldTicketCount
    )
      return "Not enough tickets";

    return "Buy tickets";
  };

  return (
    <button
      onClick={onClick}
      disabled={
        raffleIsOver ||
        !fromPublicKey ||
        isLoading ||
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
          !fromPublicKey ||
          isLoading ||
          Number(numberOfTicketsToBuy) <= 0 ||
          Number(numberOfTicketsToBuy) >
            raffle.totalTicketCount - raffle.soldTicketCount,
      })}
    >
      {getButtonText()}
    </button>
  );
};
