import { useEffect, useState } from "react";
// pages/client-side.js

import ClientOnly from "features/client-only";
import RaffleItemList from "features/raffle-item-list";
import Image from "next/image";

export default function ClientSide() {
  return (
    <div className="h-full pt-32 w-full max-w-6xl mx-auto">
      {/* top section */}
      <div className="flex w-full justify-between items-center h-64">
        <Image
          height={500}
          width={500}
          src="https://www.fillmurray.com/500/500"
          alt="Frog Image"
        />
        <div className="flex flex-col">
          <h1 className="text-6xl">RAFFLE</h1>
        </div>
      </div>
      <ClientOnly>
        <RaffleItemList />
      </ClientOnly>
    </div>
  );
}
