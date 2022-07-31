import type { NextApiHandler } from "next";
import { ADD_RAFFLE_WINNERS } from "graphql/mutations/add-raffle-winners";
import * as Sentry from "@sentry/node";
import request, { GraphQLClient } from "graphql-request";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const addRaffle: NextApiHandler = async (req, response) => {
  const { id, winnerWalletAddresses } = req.body;

  if (!id || !winnerWalletAddresses) throw new Error("Missing required fields");

  try {
    const res = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: ADD_RAFFLE_WINNERS,
      variables: {
        id,
        winnerWalletAddresses,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    console.log(res.update_raffles_by_pk.winner);

    response.json({ winner: res.update_raffles_by_pk.winner });
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default addRaffle;
