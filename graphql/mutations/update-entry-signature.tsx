import { gql } from "@apollo/client";

const UPDATE_ENTRY_SIGNATURE = gql`
  mutation UpdateEntrySignature($id: uuid, $txSignature: String) {
    update_entries(
      where: { id: { _eq: $id } }
      _set: { txSignature: $txSignature }
    ) {
      affected_rows
      returning {
        id
        txSignature
      }
    }
  }
`;

export default UPDATE_ENTRY_SIGNATURE;
