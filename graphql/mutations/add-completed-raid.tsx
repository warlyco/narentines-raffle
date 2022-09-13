import { gql } from "graphql-request";

export const ADD_COMPLETED_RAID = gql`
  mutation AddCompletedRaid(
    $walletAddress: String
    $raidId: uuid
    $payoutAmountInGoods: Int
  ) {
    insert_raids_completed_one(
      object: {
        raidId: $raidId
        walletAddress: $walletAddress
        payoutAmountInGoods: $payoutAmountInGoods
      }
    ) {
      id
      raidId
      walletAddress
      payoutAmountInGoods
    }
  }
`;
