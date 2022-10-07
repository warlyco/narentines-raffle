import type { NextApiHandler } from "next";
import { RPC_ENDPOINT } from "constants/constants";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAllDomains,
  performReverseLookupBatch,
} from "@bonfida/spl-name-service";

const getSolDomainNames: NextApiHandler = async (req, response) => {
  const { publicKey } = req.body;

  try {
    const domainKey = new PublicKey(publicKey);
    const connection = new Connection(RPC_ENDPOINT);
    const nameAccounts = await getAllDomains(connection, domainKey);
    const domainNames = await performReverseLookupBatch(
      connection,
      nameAccounts
    );

    response.status(200).json({ domainNames });
  } catch (error) {
    response.status(500).json({ error });
  }
};

export default getSolDomainNames;
