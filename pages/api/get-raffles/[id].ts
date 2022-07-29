import type { NextApiHandler } from "next";
import client from "graphql/client";
import { GET_RAFFLE_BY_ID } from "graphql/queries/get-raffle-by-id";

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const getRaffles: NextApiHandler = async (request, response) => {
  const { id } = request.query;
  try {
    const { data } = await client.request(GET_RAFFLE_BY_ID, { id });

    const { raffles_by_pk: raffle } = data;
    if (!raffle) {
      response.status(404).json({ error: "Raffle not found" });
      return;
    }

    response.json({ raffle });
  } catch (error) {
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default getRaffles;
