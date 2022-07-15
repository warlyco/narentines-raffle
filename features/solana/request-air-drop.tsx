import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, TransactionSignature } from "@solana/web3.js";
import { FC, useCallback } from "react";

export const RequestAirdrop: FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const onClick = useCallback(async () => {
    if (!publicKey) {
      console.log("error", "Wallet not connected!");
      return;
    }

    let signature: TransactionSignature = "";
    try {
      signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
      console.log("info", "Airdrop requested:", signature);

      await connection.confirmTransaction(signature, "processed");
      console.log("success", "Airdrop successful!", signature);
    } catch (error: any) {
      console.log("error", `Airdrop failed! ${error?.message}`, signature);
    }
  }, [publicKey, connection]);

  return (
    <button onClick={onClick} disabled={!publicKey}>
      Request Airdrop
    </button>
  );
};
