import type { NextApiHandler } from "next";
import client from "graphql/client";
import GET_ENTRIES_BY_WALLET from "graphql/queries/get-entries-by-wallet";

const getRaffleEntriesByWallet: NextApiHandler = async (request, response) => {
  const { raffleId, walletAddress } = request.query;

  try {
    const { data } = await client.request(GET_ENTRIES_BY_WALLET, {
      raffleId,
      walletAddress,
    });

    response.json({ count: data?.entries?.[0]?.count || 0 });
  } catch (error) {
    response.status(500).json({ error });
  }
};

export default getRaffleEntriesByWallet;
