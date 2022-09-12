import { useQuery } from "@apollo/client";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import classNames from "classnames";
import dayjs from "dayjs";
import showToast from "features/toasts/show-toast";
import { GET_TWEETS_TO_RAID } from "graphql/queries/get-tweets-to-raid";
import { useState } from "react";
import { Raid } from "types/types";

const RaidAdminPanel = () => {
  const [tweetUrl, setTweetUrl] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [raidLengthInHours, setRaidLengthInHours] = useState<string>("24");
  const [payoutAmountInGoods, setPayoutAmountInGoods] = useState<string>("1");

  const { publicKey, signMessage } = useWallet();

  const { data, refetch } = useQuery(GET_TWEETS_TO_RAID);

  const clearForm = () => {
    setTweetUrl("");
    setRaidLengthInHours("24");
    setPayoutAmountInGoods("1");
  };

  const handleAddRaid = async (event: any) => {
    event.preventDefault();
    if (!signMessage || !publicKey) return;

    const message = "Confirm that you are an admin";
    const signature = await signMessage(new TextEncoder().encode(message));
    setIsLoading(true);

    const tweetId = tweetUrl.split("/").pop();

    const { data } = await axios.get("/api/get-tweet-by-id", {
      params: {
        id: tweetId,
      },
    });

    const { tweet, includes } = data;
    const { username: posterUsername } = includes?.users?.[0];

    try {
      const { data } = await axios.post("/api/add-tweet-to-raid", {
        posterUsername,
        tweetText: tweet.text,
        tweetUrl,
        tweetId,
        raidLengthInHours: Number(raidLengthInHours),
        payoutAmountInGoods: Number(payoutAmountInGoods),
        message,
        signature: JSON.stringify(signature),
        publicKey: JSON.stringify(publicKey.toBytes()),
        publicKeyString: publicKey.toString(),
      });
      refetch();
      showToast({ primaryMessage: "Raid added!" });
      clearForm();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="m-auto">
      <h1 className="text-2xl mb-2">Add Raid</h1>
      <form className="w-full max-w-lg space-y-2 mb-8">
        <label htmlFor="mint-address" className="flex space-x-4 items-center">
          <div className="whitespace-nowrap">Tweet url</div>
          <input
            disabled={false}
            className="border p-1 w-full"
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
          />
        </label>
        <label htmlFor="mint-address" className="flex space-x-4 items-center">
          <div className="whitespace-nowrap">Raid Length in Hours</div>
          <input
            type="number"
            disabled={false}
            className="border p-1 w-full"
            min="1"
            value={raidLengthInHours}
            onChange={(e) => setRaidLengthInHours(e.target.value)}
          />
        </label>
        <label htmlFor="mint-address" className="flex space-x-4 items-center">
          <div className="whitespace-nowrap">Payout amount in $GOODS</div>
          <input
            type="number"
            disabled={false}
            className="border p-1 w-full"
            value={payoutAmountInGoods}
            onChange={(e) => setPayoutAmountInGoods(e.target.value)}
          />
        </label>
        <button
          onClick={handleAddRaid}
          className={classNames({
            "p-4 py-2 rounded border shadow mt-4": true,
            "bg-slate-400 animate-pulse": isLoading,
            "cursor-pointer": !isLoading,
          })}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </form>
      <div className="space-y-2">
        <h1 className="text-2xl mb-2">Raids</h1>
        {!!data?.tweets_to_raid.length &&
          data.tweets_to_raid.map(
            ({
              tweetId,
              tweetUrl,
              raidLengthInHours,
              createdAt,
              tweetText,
              posterUsername,
            }: Raid) => (
              <a
                href={tweetUrl}
                key={tweetId}
                className="block"
                target="_blank"
                rel="noreferrer"
              >
                <div className="border-2 border-green-800 rounded p-4 hover:bg-amber-400 pointer">
                  <div className="flex">
                    <div className="font-bold mr-2 truncate text-lg mb-2">
                      {tweetText}
                    </div>
                  </div>
                  <div className="flex">
                    <div>
                      <div className="font-bold mr-2">Tweeted by:</div>
                    </div>
                    <div>{posterUsername}</div>
                  </div>
                  <div className="flex">
                    <div>
                      <div className="font-bold mr-2">Payout:</div>
                    </div>
                    <div>{payoutAmountInGoods} $GOODS</div>
                  </div>
                  <div className="flex">
                    <div>
                      <div className="font-bold mr-2">Raid Length:</div>
                    </div>
                    <div>{raidLengthInHours} hours</div>
                  </div>
                  <div className="flex">
                    <div>
                      <div className="font-bold mr-2">Ends at:</div>
                    </div>
                    <div>
                      {dayjs(createdAt)
                        .add(raidLengthInHours, "hour")
                        .format("M/D/YY, h:mm a")}
                    </div>
                  </div>
                  <div className="flex">
                    <div>
                      <div className="font-bold mr-2">Time remaining:</div>
                    </div>
                    <div>
                      {Math.abs(
                        dayjs(Date.now()).diff(
                          dayjs(createdAt).add(raidLengthInHours, "hour"),
                          "hour",
                          true
                        )
                      ).toFixed(2)}{" "}
                      hours
                    </div>
                  </div>
                </div>
              </a>
            )
          )}
      </div>
    </div>
  );
};

export default RaidAdminPanel;
