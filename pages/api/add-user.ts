import type { NextApiHandler } from "next";
import * as Sentry from "@sentry/node";
import request from "graphql-request";
import { SENTRY_TRACE_SAMPLE_RATE } from "constants/constants";
import { ADD_USER } from "graphql/mutations/add-user";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: SENTRY_TRACE_SAMPLE_RATE,
});

const addUser: NextApiHandler = async (req, response) => {
  const { walletAddress, discordName, avatarUrl, discordId } = req.body;

  if (!walletAddress) throw new Error("Missing required fields");

  try {
    const { insert_users_one: newUser } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: ADD_USER,
      variables: {
        avatarUrl,
        walletAddress,
        discordName,
        discordId,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    console.log(newUser);

    response.json({ newUser });
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default addUser;
