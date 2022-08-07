import type { NextApiHandler } from "next";
import { GET_RAFFLES } from "graphql/queries/get-raffles";
import * as Sentry from "@sentry/node";
import { RPC_ENDPOINT } from "constants/constants";
import { SENTRY_TRACE_SAMPLE_RATE } from "constants/constants";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAllDomains,
  performReverseLookupBatch,
} from "@bonfida/spl-name-service";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: SENTRY_TRACE_SAMPLE_RATE,
});

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
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default getSolDomainNames;
