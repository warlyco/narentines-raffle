import type { NextApiHandler } from "next";
import { ADD_RAFFLE_ENTRY } from "graphql/mutations/add-raffle-entry";
import { GraphQLClient } from "graphql-request";
import * as Sentry from "@sentry/node";
import { Raffle, SplTokens } from "types/types";
import { request } from "graphql-request";
import { GET_RAFFLES } from "graphql/queries/get-raffles";
import { GET_TEST_RAFFLES } from "graphql/queries/get-test-raffles";
import {
  isProduction,
  MINT_ADDRESSES,
  RPC_ENDPOINT,
  SENTRY_TRACE_SAMPLE_RATE,
} from "constants/constants";
import verifySignature from "utils/auth/verify-signature";
import { Connection, PublicKey } from "@solana/web3.js";
import retry from "async-retry";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: SENTRY_TRACE_SAMPLE_RATE,
});

const confirmTransaction = async (
  connection: Connection,
  publicKey: PublicKey,
  numTx: number = 3,
  paymentMethod: SplTokens,
  signature: string,
  purchaseCount: number,
  bail: (e: Error) => void
) => {
  let transactionList = await connection.getSignaturesForAddress(publicKey, {
    limit: numTx,
  });

  // let signatureList = transactionList.map(
  //   (transaction) => transaction.signature
  // );
  let transactionDetails = await connection.getParsedTransactions([signature]);

  let unparsedTransactionDetails = await connection.getTransactions([
    signature,
  ]);
  console.log({
    unparsedTransactionDetails: JSON.stringify(unparsedTransactionDetails),
    signature,
  });

  if (!paymentMethod) return;
  let txConfirmed = false;
  unparsedTransactionDetails.forEach((transaction) => {
    const postTokenBalance = transaction?.meta?.postTokenBalances?.[1];
    const preTokenBalance = transaction?.meta?.preTokenBalances?.[1];
    console.log(transaction);
    if (
      postTokenBalance?.mint === MINT_ADDRESSES[paymentMethod] &&
      postTokenBalance?.owner === publicKey.toString()
    ) {
      // is valid transaction, check amount
      console.log(
        preTokenBalance.uiTokenAmount,
        postTokenBalance.uiTokenAmount,
        preTokenBalance.uiTokenAmount.uiAmount -
          postTokenBalance.uiTokenAmount.uiAmount
      );
      const tokenBalanceChangeAmount =
        preTokenBalance.uiTokenAmount.uiAmount -
        postTokenBalance.uiTokenAmount.uiAmount;
      console.log({ tokenBalanceChangeAmount, purchaseCount });
      if (purchaseCount === tokenBalanceChangeAmount) {
        txConfirmed = true;
        console.log("Transaction confirmed!");
      }
    }
  });

  if (!txConfirmed) {
    // console.error("Transaction not confirmed, retrying");
    throw new Error("Transaction not confirmed, retrying");
  }

  if (!transactionDetails?.length) {
    return [];
  }

  transactionList.forEach((transaction, i) => {
    const date = new Date(transaction.blockTime * 1000);
    const transactionInstructions =
      transactionDetails[i]?.transaction.message.instructions || [];
    console.log(`Transaction No: ${i + 1}`);
    console.log(`Signature: ${transaction.signature}`);
    console.log(`Time: ${date}`);
    console.log(`Status: ${transaction.confirmationStatus}`);
    transactionInstructions.forEach((instruction, n) => {
      console.log(
        `---Program Instructions ${n + 1}: ${
          instruction.program ? instruction.program + ":" : ""
        } ${instruction.programId.toString()}`
      );
    });
    console.log("-".repeat(20));
  });
};

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
    transaction,
    paymentMethod,
    transactionSignature,
  } = req.body;
  const query = isProduction ? GET_RAFFLES : GET_TEST_RAFFLES;
  const isSignatureVerified = verifySignature({
    message,
    signature,
    publicKey,
  });

  const connection = new Connection(RPC_ENDPOINT);

  await retry(
    async (bail) => {
      await confirmTransaction(
        connection,
        new PublicKey(walletAddress),
        1,
        paymentMethod,
        transactionSignature,
        newCount,
        bail
      );
    },
    {
      retries: 5,
    }
  );

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
