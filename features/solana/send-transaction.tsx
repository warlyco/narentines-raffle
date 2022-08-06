import { RPC_ENDPOINT, SOLANA_CLUSTER } from "constants/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import GET_ENTRIES_BY_WALLET from "graphql/queries/get-entries-by-wallet";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import classNames from "classnames";
import { Raffle, RaffleEntryResponse, RafflesResponse } from "types/types";
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";
import axios from "axios";
import { GET_RAFFLES, ADD_RAFFLE_ENTRY } from "api/raffles/endpoints";

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
}: Props) => {
  const { connection } = useConnection();

  const [isLoading, setIsLoading] = useState(false);
  const {
    publicKey: fromPublicKey,
    sendTransaction,
    signTransaction,
  } = useWallet();

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
      const solInLamports =
        (LAMPORTS_PER_SOL / 100) * Number(numberOfTicketsToBuy);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: new PublicKey(process.env.NEXT_PUBLIC_COLLECTION_WALLET),
          lamports: solInLamports,
        })
      );

      const latestBlockHash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockHash.blockhash;

      transaction.feePayer = fromPublicKey;

      const signed = await signTransaction(transaction);
      const { data } = await axios.get<RafflesResponse>(GET_RAFFLES);
      const updatedRaffle = data.raffles.find(({ id }) => id === raffle.id);

      if (!updatedRaffle) {
        toast("Unkown raffle");
        throw new Error("Unkown raffle");
      }

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
      console.log("success", "Transaction successful!", signature);

      const { data: raffleEntryData } = await axios.post<RaffleEntryResponse>(
        ADD_RAFFLE_ENTRY,
        {
          txSignature: signature,
          walletAddress: fromPublicKey.toString(),
          oldCount: entryCount,
          newCount: Number(numberOfTicketsToBuy),
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
            View
          </a>
        </div>
      );
    } catch (error) {
      console.log("error", error);
    }
  }, [
    connection,
    entryCount,
    fromPublicKey,
    numberOfTicketsToBuy,
    raffle.id,
    sendTransaction,
    signTransaction,
  ]);

  const handleGoodsPayment = useCallback(async () => {
    // const connection = new Connection(
    //   process.env.NEXT_PUBLIC_RPC_ENDPOINT || "",
    //   "confirmed"
    // );

    setIsLoading(true);

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

      const { data } = await axios.get<RafflesResponse>(GET_RAFFLES);
      const updatedRaffle = data.raffles.find(({ id }) => id === raffle.id);

      if (!updatedRaffle) {
        toast("Unkown raffle");
        throw new Error("Unkown raffle");
      }

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
      console.log("success", "Transaction successful!", signature);

      const { data: raffleEntryData } = await axios.post<RaffleEntryResponse>(
        ADD_RAFFLE_ENTRY,
        {
          txSignature: signature,
          walletAddress: fromPublicKey.toString(),
          oldCount: entryCount,
          newCount: Number(numberOfTicketsToBuy),
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
            View
          </a>
        </div>
      );
    } catch (error: any) {
      if (
        error instanceof TokenAccountNotFoundError ||
        error instanceof TokenInvalidAccountOwnerError
      ) {
        toast.custom(
          <div className="flex bg-white rounded-xl shadow-lg p-3 border-slate-400 text-center">
            Transaction failed. You must have $GOODS to buy a ticket.
          </div>
        );
      } else {
        toast.custom(
          <div className="flex bg-white rounded-xl shadow-lg p-3 border-slate-400 text-center">
            Transaction failed. Make sure you have enough SOL for for the
            transaction.
          </div>
        );
      }
      return;
    } finally {
      handleUpdateCounts();
      setIsLoading(false);
    }
  }, [
    fromPublicKey,
    sendTransaction,
    signTransaction,
    numberOfTicketsToBuy,
    raffle.priceInGoods,
    raffle.id,
    connection,
    entryCount,
    handleUpdateCounts,
  ]);

  const handlePayment = () => {
    if (raffle.priceInSol > 0) {
      handleSolPayment();
    } else {
      handleGoodsPayment();
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
    if (isLoading) return "Submitting...";
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
            raffleIsOver ||
            !fromPublicKey ||
            isLoading ||
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
