import type { NextApiHandler } from "next";
import GET_ENTRIES_BY_WALLET from "graphql/queries/get-entries-by-wallet";

import { GraphQLClient } from "graphql-request";

const getRaffleEntriesByWallet: NextApiHandler = async (request, response) => {
  const { raffleId, walletAddress } = request.query;

  const client = new GraphQLClient(
    process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
    {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    }
  );

  try {
    const entries = await client.request(GET_ENTRIES_BY_WALLET, {
      raffleId,
      walletAddress,
    });

    response.json({ count: entries?.[0]?.count || 0 });
  } catch (error) {
    response.status(500).json({ error });
  }
};

export default getRaffleEntriesByWallet;
