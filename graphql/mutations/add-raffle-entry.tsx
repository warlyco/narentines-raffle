import { gql } from "@apollo/client";

export const ADD_RAFFLE_ENTRY = gql`
  mutation upsert_entries(
    $walletAddress: String
    $raffleId: uuid
    $count: Int
  ) {
    insert_entries(
      objects: [
        { walletAddress: $walletAddress, raffleId: $raffleId, count: $count }
      ]
      on_conflict: { constraint: entries_pkey, update_columns: [count] }
    ) {
      returning {
        id
        count
      }
    }
  }
`;
