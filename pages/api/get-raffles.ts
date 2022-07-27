import type { NextApiHandler } from "next";
import client from "apollo/client";
import { GET_RAFFLES } from "graphql/queries/get-raffles";

const getRaffles: NextApiHandler = async (request, response) => {
  const { id } = request.body;

  const { data } = await client.query({
    query: GET_RAFFLES,
    variables: { id },
  });

  response.json({ raffles: data.raffles });
};

export default getRaffles;
