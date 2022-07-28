import type { NextApiHandler } from "next";
import client from "apollo/client";
import { GET_RAFFLE_BY_ID } from "graphql/queries/get-raffle-by-id";

const getRaffles: NextApiHandler = async (request, response) => {
  const { id } = request.query;
  try {
    const { data } = await client.query({
      query: GET_RAFFLE_BY_ID,
      variables: { id },
    });

    const { raffles_by_pk: raffle } = data;
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
