import type { NextApiHandler } from "next";
import client from "apollo/client";
import { ADD_RAFFLE_ENTRY } from "graphql/mutations/add-raffle-entry";

const addRaffleEntry: NextApiHandler = async (request, response) => {
  const { raffleId, walletAddress, count, soldTicketCount } = request.body;

  if (!raffleId || !walletAddress || !count || !soldTicketCount)
    throw new Error("Missing required fields");

  try {
    const { data } = await client.mutate({
      mutation: ADD_RAFFLE_ENTRY,
      variables: {
        raffleId,
        walletAddress,
        count,
        soldTicketCount,
      },
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
