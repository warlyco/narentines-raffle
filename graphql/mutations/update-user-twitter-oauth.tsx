import { gql } from "@apollo/client";

const UPDATE_USER_TWITTER_OAUTH = gql`
  mutation UpdateUserTwitterOAuth(
    $walletAddress: String
    $codeVerifier: String
    $state: String
  ) {
    update_users(
      where: { walletAddress: { _eq: $walletAddress } }
      _set: {
        twitterOAuthCodeVerifier: $codeVerifier
        twitterOAuthState: $state
      }
    ) {
      returning {
        walletAddress
        twitterOAuthState
        twitterOAuthCodeVerifier
      }
    }
  }
`;

export default UPDATE_USER_TWITTER_OAUTH;
