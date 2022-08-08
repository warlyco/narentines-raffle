import { gql } from "graphql-request";

export const ADD_USER = gql`
  mutation AddUser(
    $discordName: String
    $email: String
    $walletAddress: String
    $avatarUrl: String
    $discordId: String
  ) {
    insert_users_one(
      object: {
        discordName: $discordName
        email: $email
        walletAddress: $walletAddress
        avatarUrl: $avatarUrl
        discordId: $discordId
      }
    ) {
      id
      discordName
      walletAddress
      avatarUrl
      discordId
    }
  }
`;
