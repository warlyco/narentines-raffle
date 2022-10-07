import type { NextApiHandler } from "next";
import { GET_RAFFLES } from "graphql/queries/get-raffles";

import { request } from "graphql-request";
import { GET_TEST_RAFFLES } from "graphql/queries/get-test-raffles";
import { isProduction } from "constants/constants";

const getRaffles: NextApiHandler = async (_, response) => {
  const query = isProduction ? GET_RAFFLES : GET_TEST_RAFFLES;

  try {
    const { raffles } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: query,
      requestHeaders: {
        "X-Hasura-Role": "public",
      },
    });

    response.status(200).json({ raffles });
  } catch (error) {
    response.status(500).json({ error });
  }
};

export default getRaffles;
