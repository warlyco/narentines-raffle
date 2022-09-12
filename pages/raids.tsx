import { useQuery } from "@apollo/client";
import RaidCard from "features/raid-card";
import Spinner from "features/UI/Spinner";
import { GET_TWEETS_TO_RAID } from "graphql/queries/get-tweets-to-raid";
import { Raid } from "types/types";

const Raids = () => {
  const { data, refetch } = useQuery(GET_TWEETS_TO_RAID);

  if (!data?.tweets_to_raid)
    return (
      <>
        <Spinner />
      </>
    );

  const { tweets_to_raid: tweetsToRaid } = data;

  return (
    <div className="mt-32">
      <h1 className="text-4xl text-center">Raids</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-8 mt-4">
        {!!tweetsToRaid.length &&
          tweetsToRaid.map((raid: Raid) => (
            <RaidCard key={raid.tweetId} raid={raid} />
          ))}
      </div>
    </div>
  );
};

export default Raids;
