import type { NextApiHandler } from "next";
import { GET_RAFFLES } from "graphql/queries/get-raffles";
import * as Sentry from "@sentry/node";
import { request } from "graphql-request";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const getRaffles: NextApiHandler = async (_, response) => {
  try {
    Sentry.captureMessage(
      JSON.stringify({
        url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
        document: GET_RAFFLES,
        requestHeaders: {
          "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
      })
    );
    const res = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: GET_RAFFLES,
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    Sentry.captureMessage(JSON.stringify(res));

    response.status(200).json({ raffles: res.raffles });
  } catch (error) {
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default getRaffles;
