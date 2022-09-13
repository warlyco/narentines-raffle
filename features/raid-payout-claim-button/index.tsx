import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { User } from "types/types";

const RaidPayoutClaimButton = ({ user }: { user: User }) => {
  const { publicKey } = useWallet();

  // const [claimRaidPayout, { loading: loadingClaim }] = useMutation()

  const handleClaimPayout = async () => {
    // payout tokens

    const { data } = await axios.post("/api/init-raid-payout-claim", {
      walletAddress: publicKey?.toString(),
      totalRaidGoodsEarnedAmount:
        user.totalRaidGoodsEarnedAmount + user.raidGoodsUnclaimedAmount,
      raidGoodsUnclaimedAmount: 0,
      raidCompletedAmount: user.raidCompletedAmount + 1,
    });
    console.log(data);
    debugger;
  };

  return (
    <button
      className="text-2xl flex p-2 px-3 rounded-lg border-2 border-green-800 hover:bg-green-800 hover:text-amber-200 justify-center items-center uppercase text-green-800"
      onClick={handleClaimPayout}
    >
      <span className="mt-[2px]">Claim $GOODS</span>
    </button>
  );
};

export default RaidPayoutClaimButton;
