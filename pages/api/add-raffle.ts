import type { NextApiHandler } from "next";
import { ADD_RAFFLE } from "graphql/mutations/add-raffle";
import * as Sentry from "@sentry/node";
import { GraphQLClient } from "graphql-request";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

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
    const res = await client.request(ADD_RAFFLE, {
      endsAt,
      startsAt,
      imgSrc,
      mintAddress,
      name,
      priceInGoods,
      totalTicketCount,
    });
    Sentry.captureMessage(JSON.stringify(res));

    response.json({ data: res.addRaffle });
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default addRaffle;
