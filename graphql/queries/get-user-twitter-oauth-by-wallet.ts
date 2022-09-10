import { gql } from "@apollo/client";

const GET_USER_TWITTER_OAUTH_BY_WALLET = gql`
  query GetUserTwitterOAuthByWallet($walletAddress: String) {
    users(where: { walletAddress: { _eq: $walletAddress } }) {
      twitterOAuthCodeVerifier
      twitterOAuthState
      walletAddress
    }
  }
`;

export default GET_USER_TWITTER_OAUTH_BY_WALLET;
