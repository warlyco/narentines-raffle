import { gql } from "@apollo/client";

const UPDATE_USER_TWITTER = gql`
  mutation UpdateUserTwitter(
    $walletAddress: String
    $twitterId: String
    $twitterUsername: String
    $twitterName: String
  ) {
    update_users(
      where: { walletAddress: { _eq: $walletAddress } }
      _set: {
        twitterId: $twitterId
        twitterUsername: $twitterUsername
        twitterName: $twitterName
      }
    ) {
      returning {
        walletAddress
        twitterId
        twitterUsername
        twitterName
      }
    }
  }
`;

export default UPDATE_USER_TWITTER;
