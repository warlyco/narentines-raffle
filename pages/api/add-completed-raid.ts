import type { NextApiHandler } from "next";
import request from "graphql-request";
import { ADD_COMPLETED_RAID } from "graphql/mutations/add-completed-raid";
import UPDATE_USER_RAID_EARNINGS from "graphql/mutations/update-user-raid-earnings";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import { GET_RAID_BY_TWITTER_ID } from "graphql/queries/get-raid-by-twitter-id";
import { GET_COMPLETED_RAIDS_BY_WALLET } from "graphql/queries/get-completed-raids";
import { CompletedRaid } from "types/types";

const addCompletedRaid: NextApiHandler = async (req, res) => {
  const { tweetId, walletAddress } = req.body;

  if (!tweetId || !walletAddress) throw new Error("Missing required fields");

  try {
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

    // const alreadyCompleted = completedRaids.some(
    //   (raid: CompletedRaid) => raid.raidId === id
    // );
    const completedRaid = completedRaids.find(
      (raid: CompletedRaid) => raid.raidId === id
    );

    if (completedRaid) {
      console.log("Already completed this raid");
      res.status(200).json({ completedRaid });
      return;
    }

    const { tweets_to_raid_by_pk: tweet } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: GET_RAID_BY_TWITTER_ID,
      variables: {
        tweetId,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    if (!tweet) {
      throw new Error("Raid not found");
    }
    const { payoutAmountInGoods, id } = tweet;

    const { insert_raids_completed_one } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: ADD_COMPLETED_RAID,
      variables: {
        payoutAmountInGoods,
        walletAddress,
        raidId: id,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

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
        raidCompletedAmount: userToUpdate.raidCompletedAmount + 1,
        raidGoodsUnclaimedAmount:
          userToUpdate.raidGoodsUnclaimedAmount + payoutAmountInGoods,
        totalRaidGoodsEarnedAmount:
          userToUpdate.totalRaidGoodsEarnedAmount + payoutAmountInGoods,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    const updatedUserEarnings = update_users.returning?.[0];

    res.json({ completeRaid: insert_raids_completed_one, updatedUserEarnings });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error });
  }
};

export default addCompletedRaid;
