import { gql } from "graphql-request";

export const ADD_TWEET_TO_RAID = gql`
  mutation AddTweetToRaid(
    $tweetId: String
    $payoutAmountInGoods: Int
    $raidLengthInHours: Int
    $tweetUrl: String
  ) {
    insert_tweets_to_raid_one(
      object: {
        tweetId: $tweetId
        payoutAmountInGoods: $payoutAmountInGoods
        raidLengthInHours: $raidLengthInHours
        tweetUrl: $tweetUrl
      }
    ) {
      id
      tweetId
      payoutAmountInGoods
      tweetUrl
      raidLengthInHours
    }
  }
`;
