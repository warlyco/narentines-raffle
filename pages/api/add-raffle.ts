import type { NextApiHandler } from "next";
import client from "graphql/client";
import { ADD_RAFFLE } from "graphql/mutations/add-raffle";

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

  try {
    const { data } = await client.request(ADD_RAFFLE, {
      endsAt,
      startsAt,
      imgSrc,
      mintAddress,
      name,
      priceInGoods,
      totalTicketCount,
    });

    response.json({ data: data.addRaffle });
  } catch (error) {
    response.status(500).json({ error });
  }
};

export default addRaffle;
