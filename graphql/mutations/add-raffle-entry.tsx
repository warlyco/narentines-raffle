import { gql } from "@apollo/client";

export const ADD_RAFFLE_ENTRY = gql`
  mutation ($walletAddress: String, $raffleId: uuid, $count: Int) {
    insert_entries_one(
      object: {
        walletAddress: $walletAddress
        raffleId: $raffleId
        count: $count
      }
    ) {
      count
    }
  }
`;
