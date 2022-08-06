import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

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
