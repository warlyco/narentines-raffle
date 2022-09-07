import type { NextApiHandler } from "next";
import { ADD_RAFFLE_ENTRY } from "graphql/mutations/add-raffle-entry";
import { GraphQLClient } from "graphql-request";
import * as Sentry from "@sentry/node";
import { Raffle } from "types/types";
import { request } from "graphql-request";
import { GET_RAFFLES } from "graphql/queries/get-raffles";
import { GET_TEST_RAFFLES } from "graphql/queries/get-test-raffles";
import { isProduction, SENTRY_TRACE_SAMPLE_RATE } from "constants/constants";
import verifySignature from "utils/auth/verify-signature";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: SENTRY_TRACE_SAMPLE_RATE,
});

const addRaffleEntry: NextApiHandler = async (req, response) => {
  const {
    raffleId,
    walletAddress,
    oldCount,
    newCount,
    isVerified,
    noop,
    message,
    signature,
    publicKey,
  } = req.body;
  const query = isProduction ? GET_RAFFLES : GET_TEST_RAFFLES;
  const isSignatureVerified = verifySignature({
    message,
    signature,
    publicKey,
  });

  if (!isSignatureVerified) {
    response.status(401).json({
      error: "Signature verification failed",
    });
    return;
  }

  if (noop) return response.status(200).json({});

  if (!raffleId || !walletAddress || oldCount === undefined || !newCount)
    throw new Error("Missing required fields");

  const { raffles } = await request({
    url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
    document: query,
    requestHeaders: {
      "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
    },
  });
  const { soldTicketCount } = raffles.find(({ id }: Raffle) => id === raffleId);

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
      count: oldCount + newCount,
      soldTicketCount: soldTicketCount + newCount,
      isVerified,
    });

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
      id: data.insert_entries.returning?.[0]?.id,
    });
  } catch (error) {
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default addRaffleEntry;
