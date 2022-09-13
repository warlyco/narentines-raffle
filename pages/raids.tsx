import { useQuery } from "@apollo/client";
import { useWallet } from "@solana/wallet-adapter-react";
import dayjs from "dayjs";
import RaidCard from "features/raid-card";
import RaidEarnings from "features/raid-earnings";
import Spinner from "features/UI/Spinner";
import { GET_COMPLETED_RAIDS_BY_WALLET } from "graphql/queries/get-completed-raids";
import { GET_TWEETS_TO_RAID } from "graphql/queries/get-tweets-to-raid";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import { useEffect, useState } from "react";
import { CompletedRaid, Raid } from "types/types";

const Raids = () => {
  const { publicKey } = useWallet();
  const [showPastRaids, setShowPastRaids] = useState(false);
  const [shouldShowCompletedRaids, setShouldShowCompletedRaids] =
    useState(false);
  const [completedRaids, setCompletedRaids] = useState<CompletedRaid[]>([]);
  const { data: userData, refetch: refetchUser } = useQuery(GET_USER_BY_WALLET);
  const { data, refetch } = useQuery(GET_TWEETS_TO_RAID, {
    fetchPolicy: "network-only",
  });
  const { data: completedRaidsData, loading: loadingRaidStatus } = useQuery(
    GET_COMPLETED_RAIDS_BY_WALLET,
    {
      variables: {
        walletAddress: publicKey?.toString(),
      },
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    refetchUser();
    if (loadingRaidStatus) return;
    setCompletedRaids(completedRaidsData?.raids_completed);
  }, [
    completedRaidsData?.raids_completed,
    data,
    loadingRaidStatus,
    refetchUser,
  ]);

  if (!data?.tweets_to_raid)
    return (
      <>
        <Spinner />
      </>
    );

  const { tweets_to_raid: tweetsToRaid } = data;
  const calculateRaidEndTime = (raid: Raid) => {
    return dayjs(raid.createdAt).add(raid.raidLengthInHours, "hour");
  };

  return (
    <div className="mt-32">
      <div className="pb-16">
        <RaidEarnings />
      </div>
      <div className="flex w-full flex-col items-center">
        <div className=" text-center">
          <span className="text-4xl">Active Raids</span>
        </div>
        <div className="flex items-center space-x-6 py-3 mb-2">
          <button
            onClick={() => setShowPastRaids(!showPastRaids)}
            className="bg-amber-200 px-3 py-1 rounded hover:bg-black hover:text-amber-200"
          >
            View {showPastRaids ? "Active" : "Past"} Raids
          </button>
          {/* <label htmlFor="show-past-raids">
            <input
              type="checkbox"
              checked={shouldShowAllRaids}
              onChange={() => setShouldShowAllRaids(!shouldShowAllRaids)}
            />
            <span
              className="ml-2"
              onClick={() => setShouldShowAllRaids(!shouldShowAllRaids)}
            >
              Show past raids
            </span>
          </label> */}
          <label htmlFor="show-past-raids">
            <input
              type="checkbox"
              checked={shouldShowCompletedRaids}
              onChange={() =>
                setShouldShowCompletedRaids(!shouldShowCompletedRaids)
              }
            />
            <span
              className="ml-2"
              onClick={() =>
                setShouldShowCompletedRaids(!shouldShowCompletedRaids)
              }
            >
              Show your completed raids
            </span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16 mt-4">
        {!!tweetsToRaid.length &&
          tweetsToRaid
            .filter((raid: Raid) => {
              return showPastRaids
                ? calculateRaidEndTime(raid).isBefore(dayjs())
                : calculateRaidEndTime(raid).isAfter(dayjs());
            })
            .filter((raid: Raid) => {
              if (shouldShowCompletedRaids) {
                return raid;
              }
              return completedRaids?.every((completedRaid: CompletedRaid) => {
                return completedRaid.raidId !== raid.id;
              });
            })
            .sort((a: Raid, b: Raid) => {
              return (
                // @ts-ignore
                dayjs(b.createdAt).add(b.raidLengthInHours, "hour").format() -
                // @ts-ignore
                dayjs(a.createdAt).add(a.raidLengthInHours, "hour").format()
              );
            })
            .map((raid: Raid) => <RaidCard key={raid.tweetId} raid={raid} />)}
      </div>
    </div>
  );
};

export default Raids;
