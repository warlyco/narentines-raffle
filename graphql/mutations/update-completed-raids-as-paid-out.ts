import { gql } from "graphql-request";

export const UPDATE_COMPLETED_RAIDS_AS_PAID_OUT = gql`
  mutation UpdateCompletedRaidsAsPaidOut($raidIds: [uuid!]) {
    update_raids_completed(
      where: { raidId: { _in: $raidIds } }
      _set: { isPaidOut: true }
    ) {
      returning {
        isPaidOut
        id
        payoutAmountInGoods
        raidId
        walletAddress
      }
      affected_rows
    }
  }
`;
