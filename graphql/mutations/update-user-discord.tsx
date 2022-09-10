import { gql } from "@apollo/client";

const UPDATE_USER_DISCORD = gql`
  mutation UpdateUserDiscord(
    $walletAddress: String
    $discordAvatarUrl: String
    $discordId: String
    $discordName: String
  ) {
    update_users(
      where: { walletAddress: { _eq: $walletAddress } }
      _set: {
        discordId: $discordId
        discordAvatarUrl: $discordAvatarUrl
        discordName: $discordName
      }
    ) {
      returning {
        walletAddress
        discordAvatarUrl
        discordId
        discordName
      }
    }
  }
`;

export default UPDATE_USER_DISCORD;
