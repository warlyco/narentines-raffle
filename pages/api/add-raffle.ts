import type { NextApiHandler } from "next";
import { ADD_RAFFLE } from "graphql/mutations/add-raffle";

import { GraphQLClient } from "graphql-request";

const addRaffle: NextApiHandler = async (request, response) => {
  const {
    endsAt,
    startsAt,
    imgSrc,
    mintAddress,
    name,
    priceInGoods,
    totalTicketCount,
  } = request.body;

  if (
    !endsAt ||
    !startsAt ||
    !imgSrc ||
    !mintAddress ||
    !name ||
    !priceInGoods ||
    !totalTicketCount
  )
    throw new Error("Missing required fields");

  const client = new GraphQLClient(
    process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
    {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    }
  );

  try {
    const { addRaffle } = await client.request(ADD_RAFFLE, {
      endsAt,
      startsAt,
      imgSrc,
      mintAddress,
      name,
      priceInGoods,
      totalTicketCount,
    });

    response.json({ data: addRaffle });
  } catch (error) {
    response.status(500).json({ error });
  }
};

export default addRaffle;
