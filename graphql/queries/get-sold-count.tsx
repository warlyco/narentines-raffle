import { gql } from "@apollo/client";

export const GET_SOLD_COUNT = gql`
  query Raffles($id: uuid!) {
    raffles_by_pk(id: $id) {
      id
      soldTicketCount
    }
  }
`;
