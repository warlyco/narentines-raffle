import { useEffect, useState } from "react";
// pages/client-side.js

import ClientOnly from "features/client-only";
import RaffleItemList from "features/raffle-item-list";
import Image from "next/image";

export default function ClientSide() {
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
          <div className="text-3xl max-w-xs">
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
        <RaffleItemList />
      </ClientOnly>
    </div>
  );
}
