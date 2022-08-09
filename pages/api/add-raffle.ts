import type { NextApiHandler } from "next";
import { ADD_RAFFLE } from "graphql/mutations/add-raffle";
import * as Sentry from "@sentry/node";
import request from "graphql-request";
import { SENTRY_TRACE_SAMPLE_RATE } from "constants/constants";
import { decodeBase64, decodeUTF8 } from "tweetnacl-util";
import nacl from "tweetnacl";
import { isConstValueNode } from "graphql";

Sentry.init({
  dsn: "https://f28cee1f60984817b329898220a049bb@o1338574.ingest.sentry.io/6609786",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: SENTRY_TRACE_SAMPLE_RATE,
});

const addRaffle: NextApiHandler = async (req, response) => {
  const {
    endsAt,
    startsAt,
    imgSrc,
    mintAddress,
    name,
    priceInGoods,
    priceInSol,
    priceInDust,
    totalTicketCount,
    totalWinnerCount,
    projectWebsiteUrl,
    projectTwitterUrl,
    projectDiscordUrl,
    isTestRaffle,
    message,
    signature,
    publicKey,
    publicKeyString,
  } = req.body;

  // const reqIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // if (!reqIp || !isAllowedIp(reqIp)) {
  //   response.statusCode = 403;
  //   response.end(`Not allowed for ${reqIp}`);
  //   return;
  // }

  if (
    !endsAt ||
    !startsAt ||
    !imgSrc ||
    !name ||
    (!priceInGoods && !priceInSol && !priceInDust) ||
    !totalTicketCount ||
    !totalWinnerCount
  )
    throw new Error("Missing required fields");

  const adminWallets = process.env.NEXT_PUBLIC_ADMIN_WALLETS;

  if (!adminWallets) throw new Error("Missing admin wallet addresses");

  console.log({ message, signature, publicKey });
  console.log(
    decodeUTF8(message),
    Buffer.from(JSON.parse(signature).data),
    Buffer.from(JSON.parse(publicKey).data)
  );

  const isVerified = nacl.sign.detached.verify(
    decodeUTF8(message),
    Buffer.from(JSON.parse(signature).data),
    Buffer.from(JSON.parse(publicKey).data)
  );
  const isAdmin = adminWallets.includes(publicKeyString);
  console.log("isVerified", isVerified, "isAdmin", isAdmin);

  if (!isAdmin || !isVerified) {
    response.status(403).json("Not allowed");
    return;
  }

  try {
    const res = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: ADD_RAFFLE,
      variables: {
        endsAt,
        startsAt,
        imgSrc,
        mintAddress,
        projectWebsiteUrl,
        projectTwitterUrl,
        projectDiscordUrl,
        name,
        priceInGoods,
        priceInSol,
        priceInDust,
        totalTicketCount,
        totalWinnerCount,
        isTestRaffle: !!isTestRaffle,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    response.json({ data: res.addRaffle });
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    response.status(500).json({ error });
  }
};

export default addRaffle;
