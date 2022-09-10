import { useWallet } from "@solana/wallet-adapter-react";
import classNames from "classnames";
import RaffleAdminPanel from "features/admin/raffle-admin-panel";
import RaidAdminPanel from "features/admin/raid-admin-panel";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { AdminTabs } from "types/types";

const { NEXT_PUBLIC_ADMIN_WALLETS } = process.env;
const { RAFFLE, RAIDS } = AdminTabs;

const Admin: NextPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const wallet = useWallet();

  const [selectedTab, setSelectedTab] = useState(RAFFLE);

  useEffect(() => {
    if (!wallet || !wallet.publicKey || !NEXT_PUBLIC_ADMIN_WALLETS) return;
    if (NEXT_PUBLIC_ADMIN_WALLETS.includes(String(wallet.publicKey))) {
      setIsAdmin(true);
    }
  }, [wallet, wallet.publicKey]);

  if (!isAdmin)
    return (
      <div className="text-2xl pt-24 text-center w-full">
        you need to be an admin to view this page
      </div>
    );

  return (
    <div className="h-full w-full flex max-w-5xl mx-auto p-4 py-6 text-center">
      <div className="w-full max-w-lg mx-auto pt-24">
        <div className="flex space-x-1.5">
          <button
            onClick={() => setSelectedTab(RAFFLE)}
            className={classNames({
              "bg-amber-200 hover:text-green-800 px-4 py-2 uppercase text-xl rounded-t":
                true,
              "border-b border-b-green-800": selectedTab !== RAFFLE,
              "border-b border-b-amber-200": selectedTab === RAFFLE,
            })}
          >
            Raffle
          </button>
          <button
            onClick={() => setSelectedTab(RAIDS)}
            className={classNames({
              "bg-amber-200 hover:text-green-800 px-4 py-2 uppercase text-xl rounded-t":
                true,
              "border-b border-b-green-800": selectedTab !== RAIDS,
              "border-b border-b-amber-200": selectedTab === RAIDS,
            })}
          >
            Raids
          </button>
        </div>
        <div className="bg-amber-200 p-4 px-8 shadow-xl rounded">
          {selectedTab === RAFFLE && <RaffleAdminPanel />}
          {selectedTab === RAIDS && <RaidAdminPanel />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
