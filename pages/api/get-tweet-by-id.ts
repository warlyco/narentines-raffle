import axios from "axios";
import type { NextApiHandler } from "next";
import { TwitterApi } from "twitter-api-v2";

const tweetsEndpoint = "https://api.twitter.com/2/tweets";
const tweetsSearchEndpoint = "https://api.twitter.com/2/tweets/search/recent";

const getTweetById: NextApiHandler = async (req, response) => {
  const { id } = req.query;

  if (!process.env.TWITTER_BEARER_TOKEN) {
    response.status(500).send("TWITTER_BEARER_TOKEN not set");
  }

  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
  // @ts-ignore
  const { data: tweet, includes } = await client.v2.singleTweet(id, {
    expansions: [
      "author_id",
      "entities.mentions.username",
      "in_reply_to_user_id",
      "referenced_tweets.id",
      // "referenced_tweets",
    ],
  });

  // @ts-ignore
  const { data: usersWhoLiked } = await client.v2.tweetLikedBy(id, {});

  try {
    response.status(200).json({ tweet, includes, usersWhoLiked });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error });
  }
};

export default getTweetById;
