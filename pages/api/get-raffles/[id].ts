import type { NextApiHandler } from "next";
import client from "apollo/client";
import { GET_RAFFLE_BY_ID } from "graphql/queries/get-raffle-by-id";

const getRaffles: NextApiHandler = async (request, response) => {
  const { id } = request.query;

  const { data } = await client.query({
    query: GET_RAFFLE_BY_ID,
    variables: { id },
  });
  console.log("raffleData", data);
  const { raffles_by_pk: raffle } = data;
  if (!raffle) {
    response.status(404).json({ error: "Raffle not found" });
    return;
  }

  response.json({ raffle });
};

export default getRaffles;
