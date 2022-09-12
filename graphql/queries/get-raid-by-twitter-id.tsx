// import { gql } from "graphql-request";
import { gql } from "@apollo/client";

export const GET_RAID_BY_TWITTER_ID = gql`
  query GetRaidByTwitterId($tweetId: String!) {
    tweets_to_raid_by_pk(tweetId: $tweetId) {
      createdAt
      id
      payoutAmountInGoods
      posterUsername
      raidLengthInHours
      raiderWalletAddresses
      tweetId
      tweetText
      tweetUrl
    }
  }
`;
