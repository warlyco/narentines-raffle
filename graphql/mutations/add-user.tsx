import { gql } from "graphql-request";

export const ADD_USER = gql`
  mutation AddUser(
    $discordName: String
    $email: String
    $walletAddress: String
  ) {
    insert_users_one(
      object: {
        discordName: $discordName
        email: $email
        walletAddress: $walletAddress
      }
    ) {
      id
      discordName
      walletAddress
    }
  }
`;
