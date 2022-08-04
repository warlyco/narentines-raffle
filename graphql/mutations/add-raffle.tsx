import { gql } from "graphql-request";

export const ADD_RAFFLE = gql`
  mutation AddRaffle(
    $startsAt: timestamptz
    $endsAt: timestamptz
    $imgSrc: String
    $mintAddress: String
    $name: String
    $priceInGoods: Int
    $totalTicketCount: Int
    $totalWinnerCount: Int
    $projectWebsiteUrl: String
    $projectTwitterUrl: String
    $projectDiscordUrl: String
  ) {
    insert_raffles_one(
      object: {
        startsAt: $startsAt
        endsAt: $endsAt
        imgSrc: $imgSrc
        mintAddress: $mintAddress
        name: $name
        priceInGoods: $priceInGoods
        totalTicketCount: $totalTicketCount
        totalWinnerCount: $totalWinnerCount
        projectWebsiteUrl: $projectWebsiteUrl
        projectTwitterUrl: $projectTwitterUrl
        projectDiscordUrl: $projectDiscordUrl
      }
    ) {
      id
      name
    }
  }
`;
