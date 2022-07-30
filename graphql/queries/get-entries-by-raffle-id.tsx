import { gql } from "graphql-request";

const GET_ENTRIES_BY_RAFFLE_ID = gql`
  query GetEntriesByRaffleId($id: uuid) {
    entries(where: { raffleId: { _eq: $id } }) {
      walletAddress
      count
    }
  }
`;

export default GET_ENTRIES_BY_RAFFLE_ID;
