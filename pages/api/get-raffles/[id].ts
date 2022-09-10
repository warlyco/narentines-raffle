import type { NextApiHandler } from "next";
import { GET_RAFFLE_BY_ID } from "graphql/queries/get-raffle-by-id";
import { GraphQLClient } from "graphql-request";
import * as Sentry from "@sentry/node";
import { SENTRY_TRACE_SAMPLE_RATE } from "constants/constants";

const getRaffles: NextApiHandler = async (request, response) => {
  const client = new GraphQLClient(
    process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
    {
      headers: {
        // "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        "X-Hasura-Role": "site",
      },
    }
  );

  const { id } = request.query;
  try {
    const { raffles_by_pk: raffle } = await client.request(GET_RAFFLE_BY_ID, {
      id,
    });

    if (!raffle) {
      response.status(404).json({ error: "Raffle not found" });
      return;
    }

    response.json({ raffle });
  } catch (error) {
    response.status(500).json({ error });
  }
};

export default getRaffles;
