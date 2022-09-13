import { gql } from "@apollo/client";
export const GET_COMPLETED_RAIDS_BY_WALLET = gql`
  query GetCompletedRaidsByWallet($walletAddress: String) {
    raids_completed(where: { walletAddress: { _eq: $walletAddress } }) {
      completedAt
      id
      payoutAmountInGoods
      raidId
      walletAddress
    }
  }
`;
