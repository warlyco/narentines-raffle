import { gql } from "@apollo/client";

const UPDATE_USER_RAID_EARNINGS = gql`
  mutation UpdateUserRaidEarnings(
    $walletAddress: String
    $totalRaidGoodsEarnedAmount: Int
    $raidGoodsUnclaimedAmount: Int
    $raidCompletedAmount: Int
  ) {
    update_users(
      where: { walletAddress: { _eq: $walletAddress } }
      _set: {
        totalRaidGoodsEarnedAmount: $totalRaidGoodsEarnedAmount
        raidGoodsUnclaimedAmount: $raidGoodsUnclaimedAmount
        raidCompletedAmount: $raidCompletedAmount
      }
    ) {
      returning {
        id
        raidCompletedAmount
        raidGoodsUnclaimedAmount
        totalRaidGoodsEarnedAmount
      }
    }
  }
`;

export default UPDATE_USER_RAID_EARNINGS;
