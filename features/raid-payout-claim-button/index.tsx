import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import classNames from "classnames";
import { E001, E009, E010 } from "errors/types";
import showGenericErrorToast from "features/toasts/show-generic-error-toast";
import showToast from "features/toasts/show-toast";
import Spinner from "features/UI/Spinner";
import { useState } from "react";
import { User } from "types/types";

const RaidPayoutClaimButton = ({
  user,
  refetch,
}: {
  user: User;
  refetch: () => void;
}) => {
  const { publicKey } = useWallet();
  const [isClaimingRaidPayout, setIsClaimingRaidPayout] = useState(false);

  const handleClaimPayout = async () => {
    setIsClaimingRaidPayout(true);
    try {
      const { data } = await axios.post("/api/init-raid-payout-claim", {
        walletAddress: publicKey?.toString(),
      });
      const { raidPayoutTotal } = data;

      showToast({
        primaryMessage: "Payout claimed!",
        secondaryMessage: `Successfully claimed ${raidPayoutTotal} $GOODS`,
      });
      refetch();
    } catch (error) {
      showGenericErrorToast(E010);
    } finally {
      setIsClaimingRaidPayout(false);
    }
  };

  return (
    <>
      <button
        disabled={isClaimingRaidPayout}
        className={classNames({
          "text-2xl flex p-2 px-3 rounded-lg border-2 border-green-800 justify-center items-center uppercase text-green-800 h-16":
            true,
          "hover:bg-green-800 hover:text-amber-200": !isClaimingRaidPayout,
        })}
        onClick={handleClaimPayout}
      >
        {isClaimingRaidPayout ? (
          <>
            <div className="mr-2 mt-[2px]">
              <Spinner />
            </div>
            <span className="animate-pulse">Claiming...</span>
          </>
        ) : (
          <span className="mt-[2px]">Claim $GOODS</span>
        )}
      </button>
    </>
  );
};

export default RaidPayoutClaimButton;
