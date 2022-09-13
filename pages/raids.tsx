import { useQuery } from "@apollo/client";
import dayjs from "dayjs";
import RaidCard from "features/raid-card";
import RaidEarnings from "features/raid-earnings";
import Spinner from "features/UI/Spinner";
import { GET_TWEETS_TO_RAID } from "graphql/queries/get-tweets-to-raid";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import { useState } from "react";
import { Raid } from "types/types";

const Raids = () => {
  const [shouldShowAllRaids, setShouldShowAllRaids] = useState(false);
  const { data: userData, loading, error } = useQuery(GET_USER_BY_WALLET);
  const { data, refetch } = useQuery(GET_TWEETS_TO_RAID);

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
      <div className="flex w-full flex-col">
        <h1 className="text-4xl text-center">Active Raids</h1>
        <button
          className="underline py-1"
          onClick={() => setShouldShowAllRaids(!shouldShowAllRaids)}
        >
          {shouldShowAllRaids ? "Hide" : "Show"} Past Raids
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16 mt-4">
        {!!tweetsToRaid.length &&
          tweetsToRaid
            .filter((raid: Raid) => {
              if (shouldShowAllRaids) {
                return raid;
              }
              return calculateRaidEndTime(raid).isAfter(dayjs());
            })
            .map((raid: Raid) => <RaidCard key={raid.tweetId} raid={raid} />)}
      </div>
    </div>
  );
};

export default Raids;
