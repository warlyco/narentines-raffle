import { gql } from "graphql-request";

export const ADD_RAFFLE_WINNER = gql`
  mutation AddRaffleWinner($id: uuid!, $winnerWalletAddress: String!) {
    update_raffles_by_pk(
      pk_columns: { id: $id }
      _set: { winner: $winnerWalletAddress }
    ) {
      id
      winner
    }
  }
`;
