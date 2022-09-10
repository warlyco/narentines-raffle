import { gql } from "@apollo/client";

const UPDATE_USER_DISCORD = gql`
  mutation UpdateUserDiscord(
    $_eq: String
    $discordAvatarUrl: String
    $discordId: String
    $discordName: String
  ) {
    update_users(
      where: { walletAddress: { _eq: $_eq } }
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
