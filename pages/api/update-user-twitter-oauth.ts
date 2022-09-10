import type { NextApiHandler } from "next";

import request from "graphql-request";
import UPDATE_USER_TWITTER_OAUTH from "graphql/mutations/update-user-twitter-oauth";

const updateUserDiscord: NextApiHandler = async (req, response) => {
  const { walletAddress, codeVerifier, state } = req.body;

  if (!walletAddress || !codeVerifier || !state)
    throw new Error("Missing required fields");

  try {
    const { update_users } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: UPDATE_USER_TWITTER_OAUTH,
      variables: {
        walletAddress,
        codeVerifier,
        state,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    if (!update_users?.returning?.[0]?.count) {
      response.status(500).json({ error: "Unkown error" });
      return;
    }
    const { returning } = update_users;

    response.json({ count: returning[0].count });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error });
  }
};

export default updateUserDiscord;
