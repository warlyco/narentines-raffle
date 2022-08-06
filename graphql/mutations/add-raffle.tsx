import { gql } from "graphql-request";

export const ADD_RAFFLE = gql`
  mutation AddRaffle(
    $startsAt: timestamptz
    $endsAt: timestamptz
    $imgSrc: String
    $mintAddress: String
    $name: String
    $priceInGoods: Int
    $priceInSol: Int
    $priceInDust: Int
    $totalTicketCount: Int
    $totalWinnerCount: Int
    $projectWebsiteUrl: String
    $projectTwitterUrl: String
    $projectDiscordUrl: String
    $isTestRaffle: Boolean
  ) {
    insert_raffles_one(
      object: {
        startsAt: $startsAt
        endsAt: $endsAt
        imgSrc: $imgSrc
        mintAddress: $mintAddress
        name: $name
        priceInGoods: $priceInGoods
        priceInSol: $priceInSol
        priceInDust: $priceInDust
        totalTicketCount: $totalTicketCount
        totalWinnerCount: $totalWinnerCount
        projectWebsiteUrl: $projectWebsiteUrl
        projectTwitterUrl: $projectTwitterUrl
        projectDiscordUrl: $projectDiscordUrl
        isTestRaffle: $isTestRaffle
      }
    ) {
      id
      name
    }
  }
`;
