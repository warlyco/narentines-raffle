import { gql } from "graphql-request";

export const GET_RAFFLES = gql`
  query Raffles {
    raffles(where: { isArchived: { _eq: false } }, order_by: { endsAt: desc }) {
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
