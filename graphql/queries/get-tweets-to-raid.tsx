import { gql } from "@apollo/client";

export const GET_TWEETS_TO_RAID = gql`
  query GetTweetsToRaid {
    tweets_to_raid {
      tweetUrl
      tweetId
      raiderWalletAddresses
      raidLengthInHours
      payoutAmountInGoods
      id
      createdAt
    }
  }
`;
