import { gql } from "@apollo/client";

export const GET_USER_BY_WALLET = gql`
  query GetUserByWallet($walletAddress: String) {
    users(where: { walletAddress: { _eq: $walletAddress } }) {
      id
      twitterId
      twitterUsername
      discordAvatarUrl
      discordId
      discordName
      walletAddress
      name
      totalRaidGoodsEarnedAmount
      raidGoodsUnclaimedAmount
    }
  }
`;
