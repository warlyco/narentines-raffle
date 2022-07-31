import { gql } from "graphql-request";

export const ADD_RAFFLE_WINNERS = gql`
  mutation AddRaffleWinners($id: uuid!, $winnerWalletAddresses: json!) {
    update_raffles_by_pk(
      pk_columns: { id: $id }
      _set: { winners: $winnerWalletAddresses }
    ) {
      id
      winners
    }
  }
`;
