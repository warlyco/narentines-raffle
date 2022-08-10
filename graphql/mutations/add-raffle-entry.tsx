import { gql } from "graphql-request";

export const ADD_RAFFLE_ENTRY = gql`
  mutation upsert_entries(
    $txSignature: String
    $walletAddress: String
    $raffleId: uuid
    $count: Int
    $soldTicketCount: Int
    $isVerified: Boolean
  ) {
    insert_entries(
      objects: [
        {
          walletAddress: $walletAddress
          raffleId: $raffleId
          count: $count
          txSignature: $txSignature
          isVerified: $isVerified
        }
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
      affected_rows
      returning {
        id
        count
      }
    }
    update_raffles(
      where: { id: { _eq: $raffleId } }
      _set: { soldTicketCount: $soldTicketCount }
    ) {
      affected_rows
      returning {
        soldTicketCount
        totalTicketCount
      }
    }
  }
`;
