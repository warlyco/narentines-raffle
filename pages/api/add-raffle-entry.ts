import type { NextApiHandler } from "next";
import { ADD_RAFFLE_ENTRY } from "graphql/mutations/add-raffle-entry";

import { GraphQLClient } from "graphql-request";

const addRaffleEntry: NextApiHandler = async (request, response) => {
  const { raffleId, walletAddress, count, soldTicketCount } = request.body;

  if (!raffleId || !walletAddress || !count || !soldTicketCount)
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
    const data = await client.request(ADD_RAFFLE_ENTRY, {
      raffleId,
      walletAddress,
      count,
      soldTicketCount,
    });

    if (
      !data?.update_raffles?.returning?.[0]?.soldTicketCount ||
      !data?.update_raffles?.returning?.[0]?.totalTicketCount
    ) {
      response.status(500).json({ error: "Unkown error" });
      return;
    }

    response.json({
      updatedCount: data.update_raffles.returning?.[0]?.soldTicketCount,
      updatedTotalCoint: data.update_raffles.returning?.[0]?.totalTicketCount,
    });
  } catch (error) {
    response.status(500).json({ error });
  }
};

export default addRaffleEntry;
