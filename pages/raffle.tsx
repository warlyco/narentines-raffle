import ClientOnly from "features/client-only";
import Image from "next/image";
import RaffleList from "features/raffle-list";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

const ClientSide = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const wallet = useWallet();

  useEffect(() => {
    if (!wallet?.publicKey) return;
    setPublicKey(wallet.publicKey?.toString());
  }, [wallet, wallet.publicKey]);

  return (
    <div className="h-full w-full pb-48">
      {/* top section */}
      <div className="flex w-full justify-between items-center mb-8">
        <div className="hidden md:block md:w-1/2">
          <Image
            height={500}
            width={500}
            src="https://www.fillmurray.com/500/500"
            alt="Frog Image"
          />
        </div>
        <div className="flex flex-col space-y-4 w-full md:w-1/2 max-w-sm pt-24">
          <h1 className="text-8xl italic">RAFFLE</h1>
          <div className="text-3xl w-full md:max-w-xs">
            Aye, Aye. Rool the dice ya amphibian coward!
          </div>
          <div className="flex py-8 justify-between w-full">
            <button className="w-[47%] bg-amber-200 rounded-lg py-2 text-lg uppercase font-medium">
              Your Loot
            </button>
            <button className="w-[47%] text-amber-400 bg-green-800 rounded-lg py-2 text-lg uppercase font-medium">
              Select Booty
            </button>
          </div>
        </div>
      </div>
      <ClientOnly>
        {publicKey ? (
          <RaffleList />
        ) : (
          <div className="text-center py-16 text-6xl">connect your wallet</div>
        )}
      </ClientOnly>
    </div>
  );
};

export default ClientSide;
