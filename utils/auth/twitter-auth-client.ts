import { TWITTER_CLIENT_ID } from "constants/constants";
import { TwitterApi } from "twitter-api-v2";

const twitterAuthClient = new TwitterApi({
  clientId: TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

export default twitterAuthClient;
