import { gql } from "graphql-request";

export const ADD_USER = gql`
  mutation AddUser($walletAddress: String) {
    insert_users_one(object: { walletAddress: $walletAddress }) {
      id
      walletAddress
    }
  }
`;
