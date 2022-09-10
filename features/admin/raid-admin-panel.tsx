import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import classNames from "classnames";
import showToast from "features/toasts/show-toast";
import { useState } from "react";
import toast from "react-hot-toast";
import { Raid } from "types/types";

const RaidAdminPanel = () => {
  const [tweetUrl, setTweetUrl] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [raidLengthInHours, setRaidLengthInHours] = useState<string>("24");
  const [payoutAmountInGoods, setPayoutAmountInGoods] = useState<string>("1");
  const [addedRaid, setAddedRaid] = useState<Raid | null>(null);

  const { publicKey, signMessage } = useWallet();

  const handleAddRaid = async (event: any) => {
    event.preventDefault();
    if (!signMessage || !publicKey) return;

    const message = "Confirm that you are an admin";
    const signature = await signMessage(new TextEncoder().encode(message));
    setIsLoading(true);

    const tweetId = tweetUrl.split("/").pop();

    try {
      const { data } = await axios.post("/api/add-tweet-to-raid", {
        tweetUrl,
        tweetId,
        raidLengthInHours: Number(raidLengthInHours),
        payoutAmountInGoods: Number(payoutAmountInGoods),
        message,
        signature: JSON.stringify(signature),
        publicKey: JSON.stringify(publicKey.toBytes()),
        publicKeyString: publicKey.toString(),
      });
      setAddedRaid(data.raid);
      showToast({ primaryMessage: "Raid added!" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="m-auto">
      <h1 className="text-2xl mb-2">Add Raid</h1>
      <form className="w-full max-w-lg space-y-2">
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
    </div>
  );
};

export default RaidAdminPanel;
