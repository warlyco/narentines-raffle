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
      on_conflict: {
        update_columns: [count]
        where: {
          raffleId: { _eq: $raffleId }
          _and: { walletAddress: { _eq: $walletAddress } }
        }
        constraint: entries_walletAddress_raffleId_key
      }
    ) {
      returning {
        id
        count
      }
    }
  }
`;
