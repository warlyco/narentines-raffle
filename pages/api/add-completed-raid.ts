import type { NextApiHandler } from "next";
import request from "graphql-request";
import { ADD_COMPLETED_RAID } from "graphql/mutations/add-completed-raid";
import UPDATE_USER_RAID_EARNINGS from "graphql/mutations/update-user-raid-earnings";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";

const addCompletedRaid: NextApiHandler = async (req, res) => {
  const { raidId, walletAddress, payoutInGoods } = req.body;

  if (!raidId || !walletAddress) throw new Error("Missing required fields");

  try {
    const { insert_raids_completed_one } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: ADD_COMPLETED_RAID,
      variables: {
        payoutInGoods,
        walletAddress,
        raidId,
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
          userToUpdate.raidGoodsUnclaimedAmount + payoutInGoods,
        totalRaidGoodsEarnedAmount:
          userToUpdate.totalRaidGoodsEarnedAmount + payoutInGoods,
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
