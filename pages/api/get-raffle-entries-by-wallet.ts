import type { NextApiHandler } from "next";
import client from "apollo/client";
import GET_ENTRIES_BY_WALLET from "graphql/queries/get-entries-by-wallet";

const getRaffleEntriesByWallet: NextApiHandler = async (request, response) => {
  const { raffleId, walletAddress } = request.body;

  const { data } = await client.query({
    query: GET_ENTRIES_BY_WALLET,
    variables: { raffleId, walletAddress },
  });

  response.json({ count: data?.entries?.[0]?.count || 0 });
};

export default getRaffleEntriesByWallet;
