import { gql } from "@apollo/client";

const UPDATE_ENTRY_COUNT = gql`
  mutation UpdateEntryCount($id: uuid, $count: Int) {
    update_entries(where: { id: { _eq: $id } }, _set: { count: $count }) {
      affected_rows
      returning {
        raffleId
        isVerified
        id
        count
      }
    }
  }
`;

export default UPDATE_ENTRY_COUNT;
