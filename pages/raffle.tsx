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
      <div className="flex w-full justify-center md:justify-between items-center">
        <div className="hidden md:block md:w-1/2">
          <Image
            height={880}
            width={625}
            src="/images/jester-img.png"
            alt="Frog Image"
          />
        </div>
        <div className="flex flex-col space-y-4 w-full md:w-1/2 max-w-sm pt-32 pb-16 md:py-0">
          <Image
            src="/images/raffle-title.svg"
            width={417}
            height={120}
            alt="Raffle Title"
          />
          <div className="text-4xl w-full md:max-w-sm">
            Aye, Aye. Rool the dice ya amphibian coward!
          </div>
          {/* <div className="flex py-8 justify-between w-full">
            <button className="w-[47%] bg-amber-200 rounded-lg py-2 text-lg uppercase font-medium">
              Your Loot
            </button>
            <button className="w-[47%] text-amber-400 bg-green-800 rounded-lg py-2 text-lg uppercase font-medium">
              Select Booty
            </button>
          </div> */}
        </div>
        <div className="pr-0 md:pr-4"></div>
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
