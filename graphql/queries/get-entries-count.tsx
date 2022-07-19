import gql from "graphql-tag";

export const GET_ENTRIES_COUNT = gql`
  query Entries($walletAddress: String, $raffleId: uuid) {
    entries(
      where: {
        walletAddress: { _eq: $walletAddress }
        raffleId: { _eq: $raffleId }
      }
    ) {
      count
    }
  }
`;
