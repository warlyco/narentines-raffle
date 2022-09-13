import { useQuery } from "@apollo/client";
import { useWallet } from "@solana/wallet-adapter-react";
import RaidPayoutClaimButton from "features/raid-payout-claim-button";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import Link from "next/link";
import bg from "public/images/single-item-bg.png";
import { User } from "types/types";

const RaidEarnings = () => {
  const { publicKey } = useWallet();

  const { data: userData, loading: loadingUser } = useQuery(
    GET_USER_BY_WALLET,
    {
      variables: {
        walletAddress: publicKey?.toString(),
      },
    }
  );
  const user: User = userData?.users?.[0];

  return (
    <div
      className="mt-32 bg-amber-200 p-4 rounded-lg shadow-xl"
      style={{ backgroundImage: `url(${bg.src})` }}
    >
      <h1 className="text-4xl text-center mb-4">Raid Earnings</h1>
      {!user && (
        <div className="text-center text-2xl mb-4">
          <Link href="/me">
            <a className="underline">Connect with Twitter and Discord</a>
          </Link>{" "}
          to participate in raids.
        </div>
      )}
      {!!user && (
        <>
          <div className="flex flex-wrap mx-auto">
            <div className="w-full lg:w-1/3 flex flex-col py-3">
              <div className="text-center text-2xl font-bold mb-2">
                Raids Completed
              </div>
              <div className="text-center text-5xl font-bold">
                {user.raidCompletedAmount || 0}
              </div>
            </div>
            <div className="w-full lg:w-1/3 flex flex-col py-3">
              <div className="text-center text-2xl font-bold mb-2">
                Unclaimed
              </div>
              <div className="text-center text-5xl font-bold">
                {user.raidGoodsUnclaimedAmount || 0} $GOODS
              </div>
            </div>
            <div className="w-full lg:w-1/3 flex flex-col py-3">
              <div className="text-center text-2xl font-bold mb-2">
                Total Earnings
              </div>
              <div className="text-center text-5xl font-bold">
                {user.totalRaidGoodsEarnedAmount || 0} $GOODS
              </div>
            </div>
          </div>
          {user.raidGoodsUnclaimedAmount > 0 && (
            <div className="flex justify-center py-2">
              <RaidPayoutClaimButton user={user} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RaidEarnings;
