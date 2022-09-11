import type { NextApiHandler } from "next";
import request from "graphql-request";
import { ADD_USER } from "graphql/mutations/add-user";

const addUser: NextApiHandler = async (req, response) => {
  const { walletAddress, discordName, avatarUrl, discordId } = req.body;

  if (!walletAddress) throw new Error("Missing required fields");

  try {
    const { insert_users_one: newUser } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: ADD_USER,
      variables: {
        walletAddress,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    response.json({ newUser });
  } catch (error) {
    console.error(error);

    response.status(500).json({ error });
  }
};

export default addUser;
