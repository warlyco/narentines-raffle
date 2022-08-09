import type { NextApiHandler } from "next";
import { ADD_RAFFLE_WINNER } from "graphql/mutations/add-raffle-winner";
import * as Sentry from "@sentry/node";
import { GraphQLClient } from "graphql-request";
import { SENTRY_TRACE_SAMPLE_RATE } from "constants/constants";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: SENTRY_TRACE_SAMPLE_RATE,
});

const addRaffle: NextApiHandler = async (req, response) => {
  const { id, winnerWalletAddress } = req.body;

  if (!id || !winnerWalletAddress) throw new Error("Missing required fields");

  const client = new GraphQLClient(
    process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
    {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    }
  );

  try {
    const res = await client.request(ADD_RAFFLE_WINNER, {
      id,
      winnerWalletAddress,
      now: new Date().toISOString(),
    });

    response.revalidate("/raffle");

    response.json({ winner: res.update_raffles_by_pk.winner });
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default addRaffle;
