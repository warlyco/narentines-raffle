import { gql } from "@apollo/client";

const GET_ENTRIES_BY_WALLET = gql`
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

export default GET_ENTRIES_BY_WALLET;
