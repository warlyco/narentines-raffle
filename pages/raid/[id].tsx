import { useQuery } from "@apollo/client";
import RaidCountdown from "features/raid-countdown";
import Spinner from "features/UI/Spinner";
import { GET_RAID_BY_TWITTER_ID } from "graphql/queries/get-raid-by-twitter-id";
import { useRouter } from "next/router";
import {
  CheckCircleIcon,
  GlobeAltIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useWallet } from "@solana/wallet-adapter-react";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import dayjs from "dayjs";
import bg from "public/images/single-item-bg.png";
import axios from "axios";
import { CompletedRaid, User } from "types/types";
import showToast from "features/toasts/show-toast";
import { useCallback, useEffect, useState } from "react";
import showGenericErrorToast from "features/toasts/show-generic-error-toast";
import { E009 } from "errors/types";
import { GET_COMPLETED_RAIDS_BY_WALLET } from "graphql/queries/get-completed-raids";
import classNames from "classnames";

const Raid = () => {
  const [isCompletedByUser, setIsCompletedByUser] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { publicKey } = useWallet();
  const router = useRouter();
  const { id } = router.query;

  const {
    data: completedRaids,
    loading: loadingRaidStatus,
    refetch: refetchCompletedRaids,
  } = useQuery(GET_COMPLETED_RAIDS_BY_WALLET, {
    variables: {
      walletAddress: publicKey?.toString(),
    },
    skip: !publicKey,
    fetchPolicy: "network-only",
  });
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
      skip: !publicKey,
      fetchPolicy: "network-only",
    }
  );

  const getIsRaidCompletedByUser = useCallback(
    (completedRaids: CompletedRaid[]) => {
      return completedRaids.some((completedRaid: CompletedRaid) => {
        return data.tweets_to_raid_by_pk.id === completedRaid.raidId;
      });
    },
    [data?.tweets_to_raid_by_pk?.id]
  );

  const user: User = userData?.users?.[0];

  useEffect(() => {
    if (!loading && !data?.tweets_to_raid_by_pk?.id) {
      showToast({
        primaryMessage: "Raid not found",
      });
      router.push("/");
    }
    if (
      !data?.tweets_to_raid_by_pk ||
      !completedRaids?.raids_completed?.length ||
      !user
    )
      return;

    const isComplete = getIsRaidCompletedByUser(
      completedRaids?.raids_completed
    );

    setIsCompletedByUser(isComplete);
  }, [
    completedRaids,
    id,
    data,
    user,
    user?.twitterId,
    data?.tweets_to_raid_by_pk?.id,
    getIsRaidCompletedByUser,
    loading,
    router,
  ]);

  if (!data?.tweets_to_raid_by_pk) return null;

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

  const saveCompletedRaid = async () => {
    try {
      const { data } = await axios.post("/api/add-completed-raid", {
        tweetId,
        raidId: raid.id,
        walletAddress: publicKey?.toString(),
      });
      showToast({
        primaryMessage: "Raid complete!",
      });
      setIsCompletedByUser(true);
    } catch (error) {
      showGenericErrorToast(E009);
    }
    setIsConfirming(false);
  };

  const handleConfirmRaidInteraction = async () => {
    setIsConfirming(true);
    if (isCompletedByUser) {
      showToast({
        primaryMessage: "You've already completed this raid",
      });
      setIsConfirming(false);
      return;
    }

    const { data } = await axios.get(`/api/get-tweet-by-id?id=${tweetId}`);
    const { usersWhoLiked, usersWhoRetweeted } = data;
    const hasBeenLiked = usersWhoLiked?.some(
      ({ id }: { id: String }) => user?.twitterId === id
    );
    const hasBeenRetweeted = usersWhoRetweeted?.some(
      ({ id }: { id: String }) => user?.twitterId === id
    );
    if (hasBeenLiked && hasBeenRetweeted) {
      saveCompletedRaid();
    } else {
      showToast({
        primaryMessage: "Could not verify interaction",
        secondaryMessage: "Be sure to like, retweet, and reply to the tweet",
      });
      setIsConfirming(false);
    }
  };

  return (
    <div
      className="w-full mx-auto max-w-lg bg-amber-200 text-center mt-32 p-4 rounded shadow-xl"
      style={{ backgroundImage: `url(${bg.src})` }}
    >
      <p className="text-3xl py-2">{tweetText}</p>
      <div className="mb-2">@{posterUsername}</div>
      {loading || loadingUser || loadingRaidStatus ? (
        <div className="flex w-full justify-center items-center">
          <Spinner />
        </div>
      ) : (
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
            <div className="flex justify-around space-x-4 py-2">
              {!isCompletedByUser && (
                <a
                  href={tweetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex p-1 px-3 rounded-lg border-2 border-green-800 hover:bg-green-800 hover:text-amber-200 justify-center items-center uppercase text-green-800 h-12"
                >
                  <GlobeAltIcon className="h-6 w-6 mr-2" />
                  <div className="text-lg font-bold leading-10 mt-[2px]">
                    Go to tweet
                  </div>
                </a>
              )}
              {isCompletedByUser ? (
                <button
                  disabled
                  className="flex p-1 px-2 rounded-lg border-2 border-green-800 text-amber-200 bg-green-800 justify-center items-center uppercase "
                >
                  <CheckCircleIcon className="h-6 w-6 mr-2" />
                  <div className="text-lg font-bold leading-10 mt-[2px]">
                    Complete!
                  </div>
                </button>
              ) : (
                <button
                  onClick={handleConfirmRaidInteraction}
                  disabled={isConfirming}
                  className={classNames({
                    "flex p-1 px-3 rounded-lg border-2 border-green-800 hover:bg-green-800 hover:text-amber-200 justify-center items-center uppercase text-green-800 h-12":
                      true,
                    "hover:bg-green-800": !isConfirming,
                  })}
                >
                  {isConfirming ? (
                    <div className="mr-2 flex items-center -mt-[1px]">
                      <Spinner />
                    </div>
                  ) : (
                    <EyeIcon className="h-6 w-6 mr-2" />
                  )}
                  {isConfirming ? (
                    <div className="text-lg font-bold animate-pulse mt-[2px]">
                      Confirming...
                    </div>
                  ) : (
                    <div className="text-lg font-bold leading-10 mt-[2px]">
                      Confirm
                    </div>
                  )}
                </button>
              )}
            </div>
          )}
          {(!user?.twitterId || !user?.discordId) && (
            <div className="italic mt-4">
              Connect to Twitter and Discord to participate in raids
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Raid;
