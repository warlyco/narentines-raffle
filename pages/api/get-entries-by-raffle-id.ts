import type { NextApiHandler } from "next";

import * as Sentry from "@sentry/node";
import GET_ENTRIES_BY_RAFFLE_ID from "graphql/queries/get-entries-by-raffle-id";
import { SENTRY_TRACE_SAMPLE_RATE } from "constants/constants";
import request from "graphql-request";

const getEntriesById: NextApiHandler = async (req, response) => {
  const { id } = req.query;

  try {
    const { entries } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      variables: { id },
      document: GET_ENTRIES_BY_RAFFLE_ID,
    });

    if (!entries) {
      response.status(404).json({ error: "Entries not found" });
      return;
    }

    response.json({ entries });
  } catch (error) {
    response.status(500).json({ error });
  }
};

export default getEntriesById;
