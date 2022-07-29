import type { NextApiHandler } from "next";
import client from "apollo/client";
import { GET_RAFFLES } from "graphql/queries/get-raffles";
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const getRaffles: NextApiHandler = async (request, response) => {
  try {
    const { data } = await client.query({
      query: GET_RAFFLES,
    });

    response.json({ raffles: data.raffles });
  } catch (error) {
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default getRaffles;
