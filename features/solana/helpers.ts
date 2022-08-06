import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { SplTokens } from "types/types";

export const createSolanaTransaction = ({
  numberOfTicketsToBuy,
  fromPublicKey,
  toPublicKey,
}: {
  numberOfTicketsToBuy: number;
  fromPublicKey: PublicKey;
  toPublicKey: PublicKey;
}) => {
  const solInLamports = (LAMPORTS_PER_SOL / 100) * numberOfTicketsToBuy;

  return new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: toPublicKey,
      lamports: solInLamports,
    })
  );
};

export const getTokenMintAddress = (token: SplTokens) => {
  if (!process.env.NEXT_PUBLIC_GOODS_TOKEN_MINT_ADDRESS) {
    console.log("error", "Missing environment variables!");
    return;
  }

  switch (token) {
    case SplTokens.GOODS:
    default:
      return process.env.NEXT_PUBLIC_GOODS_TOKEN_MINT_ADDRESS;
  }
};
