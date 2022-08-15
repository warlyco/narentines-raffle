// import { gql } from "graphql-request";
import { gql } from "@apollo/client";

export const GET_TEST_RAFFLES = gql`
  query Raffles {
    raffles(
      where: { isTestRaffle: { _eq: true } }
      order_by: { endsAt: desc }
    ) {
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
      projectWebsiteUrl
      projectTwitterUrl
      projectDiscordUrl
    }
  }
`;
