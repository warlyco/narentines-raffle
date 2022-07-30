import type { NextApiHandler } from "next";
import GET_ENTRIES_BY_WALLET from "graphql/queries/get-entries-by-wallet";
import { GraphQLClient } from "graphql-request";
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const getRaffleEntriesByWallet: NextApiHandler = async (request, response) => {
  const { raffleId, walletAddress } = request.query;

  console.log("query", { raffleId, walletAddress });

  const client = new GraphQLClient(
    process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
    {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    }
  );

  try {
    const { entries } = await client.request(GET_ENTRIES_BY_WALLET, {
      raffleId,
      walletAddress,
    });

    console.log({ entries });

    response.json({ count: entries?.[0]?.count || 0 });
  } catch (error) {
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default getRaffleEntriesByWallet;
