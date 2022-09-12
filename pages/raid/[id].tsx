import { useQuery } from "@apollo/client";
import RaidCountdown from "features/raid-countdown";
import Spinner from "features/UI/Spinner";
import { GET_RAID_BY_TWITTER_ID } from "graphql/queries/get-raid-by-twitter-id";
import { useRouter } from "next/router";
import { GlobeAltIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@solana/wallet-adapter-react";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import dayjs from "dayjs";

const Raid = () => {
  const { publicKey } = useWallet();
  const router = useRouter();
  const { id } = router.query;

  const { data, loading, error } = useQuery(GET_RAID_BY_TWITTER_ID, {
    variables: {
      tweetId: id,
    },
  });

  const { data: userData, loading: loadingUser } = useQuery(
    GET_USER_BY_WALLET,
    {
      variables: {
        walletAddress: publicKey?.toString(),
      },
    }
  );
  const user = userData?.users?.[0];

  if (!data?.tweets_to_raid_by_pk) return <Spinner />;

  const { tweets_to_raid_by_pk: raid } = data;

  const {
    tweetId,
    tweetText,
    tweetUrl,
    posterUsername,
    payoutAmountInGoods,
    createdAt,
    raidLengthInHours,
  } = raid;

  const raidEndTime = dayjs(createdAt).add(raidLengthInHours, "hour");
  const raidIsOver = dayjs().isAfter(raidEndTime);

  return (
    <div className="w-full mx-auto max-w-lg bg-amber-200 text-center mt-32 p-4 rounded shadow-xl">
      <p className="text-3xl py-2">{tweetText}</p>
      <div className="mb-2">@{posterUsername}</div>
      {loading && <Spinner />}
      <div className="flex flex-col items-center text-lg space-y-2">
        <div className="flex">
          <div className="font-bold mr-2">Payout:</div>
          <div>{payoutAmountInGoods} $GOODS</div>
        </div>
        <div className="flex">
          {!raidIsOver && <div className="mr-2">Time Remaining:</div>}
          <RaidCountdown raid={raid} />
        </div>
        {!raidIsOver && !!user && !!user.twitterId && !!user.discordId && (
          <div className="flex justify-around space-x-4">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex p-1 px-2 rounded-lg border-2 border-green-800 hover:bg-green-800 hover:text-amber-200 justify-center items-center uppercase text-green-800"
            >
              <GlobeAltIcon className="h-6 w-6 mr-2" />
              <div className="text-lg font-bold">Go to tweet</div>
            </a>
            <a
              href={tweetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex p-1 px-2 rounded-lg border-2 border-green-800 hover:bg-green-800 hover:text-amber-200 justify-center items-center uppercase text-green-800"
            >
              <EyeIcon className="h-6 w-6 mr-2" />
              <div className="text-lg font-bold">Confirm</div>
            </a>
          </div>
        )}
        {(!user?.twitterId || !user?.discordId) && (
          <div className="italic mt-4">
            Connect to Twitter and Discord to participate in raids
          </div>
        )}
      </div>
    </div>
  );
};

export default Raid;
