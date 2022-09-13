import { gql } from "graphql-request";

export const ADD_COMPLETED_RAID = gql`
  mutation AddCompletedRaid(
    $walletAddress: String
    $raidId: uuid
    $payoutInGoods: Int
  ) {
    insert_raids_completed_one(
      object: {
        raidId: $raidId
        walletAddress: $walletAddress
        payoutInGoods: $payoutInGoods
      }
    ) {
      id
      raidId
      walletAddress
      payoutInGoods
    }
  }
`;
