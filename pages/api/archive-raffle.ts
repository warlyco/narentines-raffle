import type { NextApiHandler } from "next";
import * as Sentry from "@sentry/node";
import { request } from "graphql-request";
import { ARCHIVE_RAFFLE } from "graphql/mutations/archive-raffle";
import { SENTRY_TRACE_SAMPLE_RATE } from "constants/constants";

const archiveRaffle: NextApiHandler = async (req, response) => {
  const { id } = req.body;

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
    response.status(500).json({ error });
  }
};

export default archiveRaffle;
