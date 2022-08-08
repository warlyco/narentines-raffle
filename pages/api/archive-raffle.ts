import type { NextApiHandler } from "next";
import { GET_RAFFLES } from "graphql/queries/get-raffles";
import * as Sentry from "@sentry/node";
import { request } from "graphql-request";
import { ARCHIVE_RAFFLE } from "graphql/mutations/archive-raffle";
import { SENTRY_TRACE_SAMPLE_RATE } from "constants/constants";
import isAllowedIp from "utils/is-allowed-ip";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: SENTRY_TRACE_SAMPLE_RATE,
});

const archiveRaffle: NextApiHandler = async (req, response) => {
  const { id } = req.body;

  const reqIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (!reqIp || !isAllowedIp(reqIp)) {
    response.statusCode = 403;
    response.end(`Not allowed for ${reqIp}`);
    return;
  }

  try {
    const res = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: ARCHIVE_RAFFLE,
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
      variables: { id },
    });

    if (!res?.update_raffles_by_pk) {
      throw new Error("Raffle not found");
    }

    response.status(200).json(res?.update_raffles_by_pk);
  } catch (error) {
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default archiveRaffle;
