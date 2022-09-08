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
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionResponse,
} from "@solana/web3.js";
import retry from "async-retry";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: SENTRY_TRACE_SAMPLE_RATE,
});

const calculateSolCost = (
  transaction: TransactionResponse,
  price: number,
  purchaseCount: number
) => {
  const postTokenBalance = transaction?.meta?.postBalances[0];
  const preTokenBalance = transaction?.meta?.preBalances[0];
  const fee = transaction?.meta?.fee;

  if (!postTokenBalance || !preTokenBalance || !fee) {
    console.log("no balance found");
    return {
      totalCost: 0,
      tokenBalanceChangeAmount: 0,
    };
  }
  const tokenBalanceChangeAmount = preTokenBalance - (postTokenBalance + fee);
  const totalCost = price * purchaseCount * LAMPORTS_PER_SOL;

  console.log("calculateSolCost", {
    postTokenBalance,
    preTokenBalance,
    fee,
    tokenBalanceChangeAmount,
    totalCost,
    purchaseCount,
  });

  return {
    totalCost,
    tokenBalanceChangeAmount,
  };
};

const calculateSplCost = (
  transaction: TransactionResponse,
  ownerPublicKey: PublicKey,
  price: number,
  purchaseCount: number
) => {
  const postTokenBalance = transaction?.meta?.postTokenBalances?.find(
    (balance: any) => balance.owner === ownerPublicKey.toString()
  );
  const preTokenBalance = transaction?.meta?.preTokenBalances?.find(
    (balance: any) => balance.owner === ownerPublicKey.toString()
  );
  if (
    !preTokenBalance?.uiTokenAmount?.uiAmount ||
    !postTokenBalance?.uiTokenAmount?.uiAmount
  ) {
    console.log("no balance found");
    return {
      totalCost: 0,
      tokenBalanceChangeAmount: 0,
    };
  }

  const tokenBalanceChangeAmount = (
    preTokenBalance?.uiTokenAmount?.uiAmount -
    postTokenBalance.uiTokenAmount.uiAmount
  ).toFixed(8);
  const totalCost = (price * purchaseCount).toFixed(8);

  console.log("calculateSplCost", {
    postTokenBalance,
    preTokenBalance,
    tokenBalanceChangeAmount,
    purchaseCount,
    totalCost,
  });

  return {
    totalCost,
    tokenBalanceChangeAmount,
  };
};

const confirmTransaction = async (
  connection: Connection,
  publicKey: PublicKey,
  numTx: number = 3,
  paymentMethod: SplTokens,
  price: number,
  signature: string,
  purchaseCount: number,
  bail: (e: Error) => void
) => {
  let transactionList = await connection.getSignaturesForAddress(publicKey, {
    limit: numTx,
  });

  let transactionDetails = await connection.getParsedTransactions([signature]);

  let unparsedTransactionDetails = await connection.getTransactions([
    signature,
  ]);

  if (!paymentMethod) return;
  let txConfirmed = false;

  unparsedTransactionDetails.forEach((transaction) => {
    if (!transaction?.meta) return;

    let totalCost;
    let tokenBalanceChangeAmount;
    if (paymentMethod === SplTokens.SOL) {
      const {
        totalCost: solTotalCost,
        tokenBalanceChangeAmount: solTokenBalanceChangeAmount,
      } = calculateSolCost(transaction, price, purchaseCount);
      totalCost = solTotalCost;
      tokenBalanceChangeAmount = solTokenBalanceChangeAmount;
    } else {
      const {
        totalCost: splTotalCost,
        tokenBalanceChangeAmount: splTokenBalanceChangeAmount,
      } = calculateSplCost(transaction, publicKey, price, purchaseCount);
      totalCost = splTotalCost;
      tokenBalanceChangeAmount = splTokenBalanceChangeAmount;
    }
    console.log(transaction);

    if (totalCost === tokenBalanceChangeAmount) {
      txConfirmed = true;
      console.log("Transaction confirmed!");
    }
  });

  if (!txConfirmed) {
    console.error("Transaction not confirmed, retrying");
    throw new Error("Transaction not confirmed, retrying");
  }

  if (!transactionDetails?.length) {
    return [];
  }

  transactionList.forEach((transaction, i) => {
    // @ts-ignore
    const date = new Date(transaction.blockTime * 1000);
    const transactionInstructions =
      transactionDetails[i]?.transaction.message.instructions || [];
    console.log(`Transaction No: ${i + 1}`);
    console.log(`Signature: ${transaction.signature}`);
    console.log(`Time: ${date}`);
    // @ts-ignore
    console.log(`Status: ${transaction.confirmationStatus}`);
    transactionInstructions.forEach((instruction, n) => {
      console.log(
        `---Program Instructions ${n + 1}: ${
          // @ts-ignore
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
    paymentMethod,
    transactionSignature,
  } = req.body;

  if (noop) return response.status(200).json({});

  const query = isProduction ? GET_RAFFLES : GET_TEST_RAFFLES;
  const connection = new Connection(RPC_ENDPOINT);

  const { raffles } = await request({
    url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
    document: query,
    requestHeaders: {
      "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
    },
  });
  const {
    soldTicketCount,
    priceInGoods,
    priceInSol,
    priceInDust,
    priceInForge,
    priceInGear,
  } = raffles.find(({ id }: Raffle) => id === raffleId);

  const client = new GraphQLClient(
    process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
    {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    }
  );

  try {
    let price: number;

    switch (paymentMethod) {
      case SplTokens.DUST:
        price = priceInDust;
        break;
      case SplTokens.GOODS:
        price = priceInGoods;
        break;
      case SplTokens.FORGE:
        price = priceInForge;
        break;
      case SplTokens.GEAR:
        price = priceInGear;
        break;
      case SplTokens.SOL:
        price = priceInSol;
        break;

      default:
        break;
    }

    await retry(
      async (bail) => {
        await confirmTransaction(
          connection,
          new PublicKey(walletAddress),
          1,
          paymentMethod,
          price,
          transactionSignature,
          newCount,
          bail
        );
      },
      {
        retries: 8,
      }
    );
  } catch (error) {
    return response
      .status(500)
      .json({ error: "Could not confirm solana transaction" });
  }

  if (!raffleId || !walletAddress || oldCount === undefined || !newCount)
    throw new Error("Missing required fields");

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
