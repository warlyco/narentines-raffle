import { gql } from "@apollo/client";

export const ADD_RAFFLE = gql`
  mutation AddRaffle(
    $endsAt: timestamptz
    $startsAt: timestamptz
    $imgSrc: String
    $mintAddress: String
    $name: String
    $priceInGoods: Int
    $totalTicketCount: Int
  ) {
    insert_raffles_one(
      object: {
        startsAt: "now()"
        endsAt: $endsAt
        imgSrc: $imgSrc
        mintAddress: $mintAddress
        name: $name
        priceInGoods: $priceInGoods
        totalTicketCount: $totalTicketCount
      }
    ) {
      id
      name
    }
  }
`;
