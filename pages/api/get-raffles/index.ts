import type { NextApiHandler } from "next";
import client from "apollo/client";
import { GET_RAFFLES } from "graphql/queries/get-raffles";

const getRaffles: NextApiHandler = async (request, response) => {
  const { data } = await client.query({
    query: GET_RAFFLES,
  });

  response.json({ raffles: data.raffles });
};

export default getRaffles;
