import type { NextApiHandler } from "next";
import { ADD_RAFFLE_ENTRY } from "graphql/mutations/add-raffle-entry";
import { GraphQLClient } from "graphql-request";
import * as Sentry from "@sentry/node";
import axios from "axios";
import { Raffle, RafflesResponse } from "types/types";
import { request } from "graphql-request";
import { GET_RAFFLES } from "graphql/queries/get-raffles";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const addRaffleEntry: NextApiHandler = async (req, response) => {
  const { raffleId, walletAddress, oldCount, newCount, txSignature } = req.body;

  console.log("req.body", req.body);

  if (
    !raffleId ||
    !walletAddress ||
    oldCount === undefined ||
    !newCount ||
    !txSignature
  )
    throw new Error("Missing required fields");

  const { raffles } = await request({
    url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
    document: GET_RAFFLES,
    requestHeaders: {
      "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
    },
  });
  const { soldTicketCount } = raffles.find(({ id }: Raffle) => id === raffleId);
  console.log({ soldTicketCount, newCount });

  const client = new GraphQLClient(
    process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
    {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    }
  );

  try {
    const data = await client.request(ADD_RAFFLE_ENTRY, {
      txSignature,
      raffleId,
      walletAddress,
      count: oldCount + newCount,
      soldTicketCount: soldTicketCount + newCount,
    });

    console.log("affected rows", data.update_raffles.affected_rows);

    if (
      !data?.update_raffles?.returning?.[0]?.soldTicketCount ||
      !data?.update_raffles?.returning?.[0]?.totalTicketCount
    ) {
      response.status(500).json({ error: "Unkown error" });
      return;
    }

    response.json({
      updatedCount: oldCount + newCount,
      updatedSoldCount: data.update_raffles.returning?.[0]?.soldTicketCount,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default addRaffleEntry;
