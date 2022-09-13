import type { NextApiHandler } from "next";
import request from "graphql-request";
import {
  GOODS_TOKEN_MINT_ADDRESS,
  RPC_ENDPOINT,
  RAID_PAYOUT_WALLET_ADDRESS,
} from "constants/constants";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import * as bs58 from "bs58";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import UPDATE_USER_RAID_EARNINGS from "graphql/mutations/update-user-raid-earnings";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import { GET_COMPLETED_RAIDS_BY_WALLET } from "graphql/queries/get-completed-raids";
import { CompletedRaid } from "types/types";

// With Payout From Backend
const initRewardClaim: NextApiHandler = async (req, res) => {
  const {
    totalRaidGoodsEarnedAmount,
    raidGoodsUnclaimedAmount,
    walletAddress,
    raidCompletedAmount,
  } = req.body;

  console.log({
    totalRaidGoodsEarnedAmount,
    raidGoodsUnclaimedAmount,
    walletAddress,
    raidCompletedAmount,
  });

  if (
    !totalRaidGoodsEarnedAmount ||
    !walletAddress ||
    !raidCompletedAmount ||
    !process.env.PRIVATE_KEY
  )
    throw new Error("Missing required fields");

  if (
    typeof raidGoodsUnclaimedAmount !== "number" ||
    raidGoodsUnclaimedAmount < 0
  ) {
    throw new Error("Invalid raid goods unclaimed amount");
  }

  const { raids_completed: completedRaids } = await request({
    url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
    document: GET_COMPLETED_RAIDS_BY_WALLET,
    variables: {
      walletAddress,
    },
    requestHeaders: {
      "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
    },
  });

  console.log("completedRaids", completedRaids);
  const raidPayoutTotal = completedRaids.reduce(
    (partialSum: number, raid: CompletedRaid) =>
      partialSum + raid.payoutInGoods,
    0
  );
  console.log("raidPayoutTotal", raidPayoutTotal);

  const connection = new Connection(RPC_ENDPOINT);
  const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));

  let fromTokenAccount;
  try {
    fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      new PublicKey(GOODS_TOKEN_MINT_ADDRESS),
      new PublicKey(RAID_PAYOUT_WALLET_ADDRESS),
      false,
      "confirmed",
      {},
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  } catch (error) {
    res.status(500).json({ error });
    return;
  }

  let toTokenAccount;
  try {
    toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      new PublicKey(GOODS_TOKEN_MINT_ADDRESS),
      new PublicKey(walletAddress),
      false,
      "confirmed",
      {},
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  } catch (error) {
    res.status(500).json({ error });
    return;
  }

  const transaction = new Transaction();
  transaction.add(
    createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      new PublicKey(RAID_PAYOUT_WALLET_ADDRESS),
      raidPayoutTotal * 100,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  let confirmation;
  try {
    const latestBlockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockHash.blockhash;
    console.log("sending transaction...");

    confirmation = await sendAndConfirmTransaction(
      connection,
      transaction,
      [keypair],
      {
        commitment: "finalized",
        maxRetries: 10,
      }
    );
    console.log("confirmation", confirmation);
    if (!confirmation) {
      res.status(500).json({ error: "Transaction failed" });
      return;
    }

    const { users } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: GET_USER_BY_WALLET,
      variables: {
        walletAddress,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    const userToUpdate = users?.[0];

    if (!userToUpdate) {
      res.status(500).json({ error: "User not found" });
    }

    const { update_users } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: UPDATE_USER_RAID_EARNINGS,
      variables: {
        walletAddress,
        raidCompletedAmount: userToUpdate.raidCompletedAmount,
        raidGoodsUnclaimedAmount: 0,
        totalRaidGoodsEarnedAmount:
          userToUpdate.totalRaidGoodsEarnedAmount + raidPayoutTotal,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });
  } catch (error) {
    res.status(500).json({ error });
    return;
  }
  res.json({ confirmation });
};

export default initRewardClaim;
