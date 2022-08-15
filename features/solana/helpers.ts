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
  pricePerTicket,
}: {
  numberOfTicketsToBuy: number;
  pricePerTicket: number;
  fromPublicKey: PublicKey;
  toPublicKey: PublicKey;
}) => {
  const amountOfSol = numberOfTicketsToBuy * pricePerTicket;
  const solInLamports = LAMPORTS_PER_SOL * amountOfSol;

  return new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: toPublicKey,
      lamports: solInLamports,
    })
  );
};

export const getTokenMintAddress = (token: SplTokens) => {
  if (
    !process.env.NEXT_PUBLIC_GOODS_TOKEN_MINT_ADDRESS ||
    !process.env.NEXT_PUBLIC_DUST_TOKEN_MINT_ADDRESS ||
    !process.env.NEXT_PUBLIC_FORGE_TOKEN_MINT_ADDRESS ||
    !process.env.NEXT_PUBLIC_GEAR_TOKEN_MINT_ADDRESS
  ) {
    console.log("error", "Missing environment variables!");
    return;
  }

  switch (token) {
    case SplTokens.GOODS:
      return process.env.NEXT_PUBLIC_GOODS_TOKEN_MINT_ADDRESS;
    case SplTokens.DUST:
      return process.env.NEXT_PUBLIC_DUST_TOKEN_MINT_ADDRESS;
    case SplTokens.FORGE:
      return process.env.NEXT_PUBLIC_FORGE_TOKEN_MINT_ADDRESS;
    case SplTokens.GEAR:
      return process.env.NEXT_PUBLIC_GEAR_TOKEN_MINT_ADDRESS;
  }
};
