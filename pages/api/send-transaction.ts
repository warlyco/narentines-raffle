import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Request, Response } from "express-serve-static-core";

const sendTransaction = async (req: Request, res: Response) => {
  const { NEXT_PUBLIC_RPC_ENDPOINT, NEXT_PUBLIC_COLLECTION_WALLET } =
    process.env;
  if (!NEXT_PUBLIC_RPC_ENDPOINT || !NEXT_PUBLIC_COLLECTION_WALLET) {
    return res.status(500).send("Config missing setting");
  }

  const connection = new Connection(NEXT_PUBLIC_RPC_ENDPOINT, "confirmed");

  const from = new PublicKey(req.body.fromAddress);
  const airdropSignature = await connection.requestAirdrop(
    from,
    LAMPORTS_PER_SOL
  );

  const latestBlockHash = await connection.getLatestBlockhash();

  await connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    },
    "finalized"
  );

  const to = new PublicKey(NEXT_PUBLIC_COLLECTION_WALLET);

  // Add transfer instruction to transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: LAMPORTS_PER_SOL / 100,
    })
  );

  // Sign transaction, broadcast, and confirm
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    // @ts-ignore
    from,
  ]);
  return signature;
};

export default async function handler(req: Request, res: Response) {
  if (!req.body?.fromAddress) {
    res.status(500).send("nft mint required");
    return;
  }

  const signature = sendTransaction(req, res);

  res.status(200).json({ signature });
}
