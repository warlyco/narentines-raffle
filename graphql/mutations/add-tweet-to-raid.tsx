import { gql } from "graphql-request";

export const ADD_TWEET_TO_RAID = gql`
  mutation AddTweetToRaid(
    $posterUsername: String
    $tweetText: String
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
        posterUsername: $posterUsername
        tweetText: $tweetText
      }
    ) {
      id
      tweetId
      payoutAmountInGoods
      tweetUrl
      raidLengthInHours
      posterUsername
      tweetText
    }
  }
`;
