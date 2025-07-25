import type { NextApiHandler } from "next";
import { ADD_RAFFLE } from "graphql/mutations/add-raffle";
import request from "graphql-request";
import verifySignature from "utils/auth/verify-signature";
import verifyAdmin from "utils/auth/verify-admin";

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
    priceInForge,
    priceInGear,
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

  if (
    !endsAt ||
    !startsAt ||
    !imgSrc ||
    !name ||
    (!priceInGoods &&
      !priceInSol &&
      !priceInDust &&
      !priceInForge &&
      !priceInGear) ||
    !totalTicketCount
  )
    throw new Error("Missing required fields");

  const isAdmin = verifyAdmin(publicKeyString);
  const isVerified = verifySignature({ message, signature, publicKey });

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
        priceInForge,
        priceInGear,
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

    response.status(500).json({ error });
  }
};

export default addRaffle;
