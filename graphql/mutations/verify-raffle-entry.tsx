import { gql } from "@apollo/client";

const VERIFY_RAFFLE_ENTRY = gql`
  mutation VerifyRaffleEntry($id: uuid) {
    update_entries(where: { id: { _eq: $id } }, _set: { isVerified: true }) {
      affected_rows
      returning {
        raffleId
        isVerified
        id
      }
    }
  }
`;

export default VERIFY_RAFFLE_ENTRY;
