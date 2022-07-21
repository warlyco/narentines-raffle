import { ApolloQueryResult, useMutation } from "@apollo/client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
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
import { Raffle } from "types/types";
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";

type Props = {
  raffle: Raffle;
  entryCount: number;
  numberOfTicketsToBuy: string;
  setNumberOfTicketsToBuy: any;
  raffleIsOver: boolean;
  refetch: () => Promise<ApolloQueryResult<any>>;
};

export const SendTransaction = ({
  raffle,
  entryCount,
  numberOfTicketsToBuy,
  setNumberOfTicketsToBuy,
  raffleIsOver,
  refetch,
}: Props) => {
  const { connection } = useConnection();
  const {
    publicKey: fromPublicKey,
    sendTransaction,
    signTransaction,
  } = useWallet();
  const [addRaffleEntry, { data, loading, error }] = useMutation(
    ADD_RAFFLE_ENTRY,
    {
      refetchQueries: [
        {
          query: GET_ENTRIES_COUNT,
          variables: {
            raffleId: raffle.id,
            walletAddress: fromPublicKey?.toString(),
          },
        },
      ],
    }
  );

  const onClick = useCallback(async () => {
    if (!fromPublicKey || !sendTransaction || !signTransaction) {
      console.log("error", "Wallet not connected!");
      return;
    }
    if (
      !process.env.NEXT_PUBLIC_GOODS_TOKEN_ADDRESS ||
      !process.env.NEXT_PUBLIC_COLLECTION_WALLET ||
      !process.env.NEXT_PUBLIC_GOODS_TOKEN_MINT_ADDRESS ||
      !process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS ||
      !process.env.NEXT_PUBLIC_COLLECTION_WALLET
    ) {
      console.log("error", "Config error");
      return;
    }

    let signature: TransactionSignature = "";
    // try {
    //   const { data } = await refetch();
    //   const updatedRaffle = data?.raffles?.find(
    //     (r: Raffle) => r.id === raffle.id
    //   );
    //   const { totalTicketCount, soldTicketCount } = updatedRaffle;
    //   if (totalTicketCount - soldTicketCount <= 0) {
    //     toast("Raffle is sold out!");
    //     throw new Error("Raffle is sold out!");
    //     return;
    //   }
    //   // SOL
    //   const solInLamports =
    //     (LAMPORTS_PER_SOL / 100) * Number(numberOfTicketsToBuy);

    //   const transaction = new Transaction().add(
    //     SystemProgram.transfer({
    //       fromPubkey: fromPublicKey,
    //       toPubkey: new PublicKey(process.env.NEXT_PUBLIC_COLLECTION_WALLET),
    //       lamports: solInLamports,
    //     })
    //   );

    // SPL TOKEN
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
          // imported from '@solana/spl-token'
          fromTokenAccount.address,
          toTokenAccount.address,
          fromPublicKey,
          amount * 100, // tokens have 6 decimals of precision so your amount needs to have the same
          [],
          TOKEN_PROGRAM_ID // imported from '@solana/spl-token'
        )
      );

      const latestBlockHash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockHash.blockhash;

      transaction.feePayer = fromPublicKey;

      const signed = await signTransaction(transaction);

      const { data } = await refetch();
      const updatedRaffle = data?.raffles?.find(
        (r: Raffle) => r.id === raffle.id
      );
      const { totalTicketCount, soldTicketCount } = updatedRaffle;
      if (totalTicketCount - soldTicketCount <= 0) {
        toast("Raffle is sold out!");
        throw new Error("Raffle is sold out!");
        return;
      }
      if (totalTicketCount - soldTicketCount < Number(numberOfTicketsToBuy)) {
        toast("Not enough tickets left");
        throw new Error("Not enough tickets left");
        return;
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
          walletAddress: fromPublicKey.toString(),
          count: entryCount + Number(numberOfTicketsToBuy),
          soldTicketCount:
            raffle.soldTicketCount + Number(numberOfTicketsToBuy),
          raffleId: raffle.id,
        },
      });
    } catch (error: any) {
      console.log("error", `Transaction failed! ${error?.message}`, signature);
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
    refetch,
    numberOfTicketsToBuy,
    raffle.priceInGoods,
    raffle.soldTicketCount,
    raffle.id,
    connection,
    addRaffleEntry,
    entryCount,
    setNumberOfTicketsToBuy,
  ]);

  const getButtonText = () => {
    if (raffleIsOver) return "Raffle is over";
    if (loading) return "Submitting...";
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
          !fromPublicKey ||
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
