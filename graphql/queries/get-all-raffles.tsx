import { gql } from "graphql-request";

export const GET_RAFFLES = gql`
  query Raffles {
    raffles {
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
      priceInSol
      priceInDust
      priceInForge
      priceInGear
      imgSrc
      winner
      winners
      totalWinnerCount
      isArchived
    }
  }
`;
