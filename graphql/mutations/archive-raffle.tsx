import { gql } from "graphql-request";

export const ARCHIVE_RAFFLE = gql`
  mutation ArchiveRaffle($id: uuid!) {
    update_raffles_by_pk(pk_columns: { id: $id }, _set: { isArchived: true }) {
      id
      isArchived
      name
    }
  }
`;
