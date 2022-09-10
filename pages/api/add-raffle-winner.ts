import type { NextApiHandler } from "next";
import { ADD_RAFFLE_WINNER } from "graphql/mutations/add-raffle-winner";
import * as Sentry from "@sentry/node";
import request, { GraphQLClient } from "graphql-request";
import { SENTRY_TRACE_SAMPLE_RATE } from "constants/constants";

const addRaffle: NextApiHandler = async (req, response) => {
  const { id, winnerWalletAddress } = req.body;

  if (!id || !winnerWalletAddress) throw new Error("Missing required fields");

  try {
    const res = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: ADD_RAFFLE_WINNER,
      variables: {
        id,
        winnerWalletAddress,
        now: new Date().toISOString(),
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    response.json({ winner: res.update_raffles_by_pk.winner });
  } catch (error) {
    console.error(error);

    response.status(500).json({ error });
  }
};

export default addRaffle;
