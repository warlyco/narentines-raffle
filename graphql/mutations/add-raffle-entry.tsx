import { gql } from "graphql-request";

export const ADD_RAFFLE_ENTRY = gql`
  mutation AddRaffle(
    $walletAddress: String
    $raffleId: uuid
    $count: Int
    $soldTicketCount: Int
  ) {
    insert_entries(
      objects: [
        { walletAddress: $walletAddress, raffleId: $raffleId, count: $count }
      ]
    ) {
      affected_rows
      returning {
        count
        id
      }
    }
    update_raffles(
      where: { id: { _eq: $raffleId } }
      _set: { soldTicketCount: $soldTicketCount }
    ) {
      returning {
        id
        soldTicketCount
        totalTicketCount
      }
    }
  }
`;
