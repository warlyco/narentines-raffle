import type { NextApiHandler } from "next";

import { GraphQLClient } from "graphql-request";
import * as Sentry from "@sentry/node";
import GET_ENTRIES_BY_RAFFLE_ID from "graphql/queries/get-entries-by-raffle-id";
import { SENTRY_TRACE_SAMPLE_RATE } from "constants/constants";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: SENTRY_TRACE_SAMPLE_RATE,
});

const getEntriesById: NextApiHandler = async (request, response) => {
  const client = new GraphQLClient(
    process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
    {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    }
  );

  const { id } = request.query;

  try {
    const { entries } = await client.request(GET_ENTRIES_BY_RAFFLE_ID, {
      id,
    });

    if (!entries) {
      response.status(404).json({ error: "Entries not found" });
      return;
    }

    response.json({ entries });
  } catch (error) {
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default getEntriesById;
