import type { NextApiHandler } from "next";
import { GET_RAFFLES } from "graphql/queries/get-raffles";
import * as Sentry from "@sentry/node";
import { request } from "graphql-request";
import { GET_TEST_RAFFLES } from "graphql/queries/get-test-raffles";
import { isProduction } from "constants/constants";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const getRaffles: NextApiHandler = async (_, response) => {
  const query = isProduction ? GET_RAFFLES : GET_TEST_RAFFLES;

  try {
    const { raffles } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: query,
      requestHeaders: {
        // "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        "X-Hasura-Role": "public",
      },
    });

    response.status(200).json({ raffles });
  } catch (error) {
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default getRaffles;
