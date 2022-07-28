import gql from "graphql-tag";

export const GET_RAFFLE_BY_ID = gql`
  query Raffles($id: uuid!) {
    raffles_by_pk(id: $id) {
      id
      name
      mintAddress
      endsAt
      createdAt
      startsAt
      updatedAt
      totalTicketCount
      soldTicketCount
      priceInGoods
      imgSrc
    }
  }
`;
