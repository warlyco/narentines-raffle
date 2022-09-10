import type { NextApiHandler } from "next";
import request from "graphql-request";
import verifySignature from "utils/auth/verify-signature";
import verifyAdmin from "utils/auth/verify-admin";
import { ADD_TWEET_TO_RAID } from "graphql/mutations/add-tweet-to-raid";

const addTweetToRaid: NextApiHandler = async (req, response) => {
  const {
    message,
    tweetId,
    tweetUrl,
    raidLengthInHours,
    payoutAmountInGoods,
    signature,
    publicKey,
    publicKeyString,
  } = req.body;

  if (
    !tweetId ||
    !raidLengthInHours ||
    !payoutAmountInGoods ||
    !signature ||
    !publicKey ||
    !publicKeyString ||
    !message ||
    !tweetUrl
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
      document: ADD_TWEET_TO_RAID,
      variables: {
        tweetId,
        tweetUrl,
        raidLengthInHours,
        payoutAmountInGoods,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    response.json({ data: res.addRaffle });
  } catch (error) {
    response.status(500).json({ error });
  }
};

export default addTweetToRaid;
