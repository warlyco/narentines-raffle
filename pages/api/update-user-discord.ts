import type { NextApiHandler } from "next";

import request from "graphql-request";
import UPDATE_USER_DISCORD from "graphql/mutations/update-user-discord";

const updateUserDiscord: NextApiHandler = async (req, res) => {
  if (req?.body?.noop) {
    res.status(200).json({ noop: true });
    return;
  }

  const { discordAvatarUrl, walletAddress, discordName, discordId } = req.body;

  if (!walletAddress || !discordName || !discordId)
    throw new Error("Missing required fields");

  try {
    const { update_users } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: UPDATE_USER_DISCORD,
      variables: {
        discordAvatarUrl,
        walletAddress,
        discordName,
        discordId,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    console.log(update_users);

    if (!update_users?.returning?.[0]?.walletAddress) {
      res.status(500).json({ error: "Missing wallet address" });
      return;
    }
    console.log({ update_users });
    res.json({ update_users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export default updateUserDiscord;
