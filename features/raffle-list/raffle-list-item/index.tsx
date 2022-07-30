import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Image from "next/image";
import { Raffle, RaffleEntryResponse } from "types/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { SendTransaction } from "features/solana/send-transaction";
import { useCallback, useEffect, useState } from "react";
import bg from "public/images/single-item-bg.png";

import axios from "axios";
import { GET_ENTRIES_BY_WALLET } from "api/raffles/endpoints";

dayjs.extend(relativeTime);

type Props = {
  raffle: Raffle;
};

type CountResponse = {
  count: number;
  soldTicketCount: number;
};

export const RaffleListItem = ({ raffle }: Props) => {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [entryCount, setEntryCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [raffleIsOver, setRaffleIsOver] = useState(false);
  const [numberOfTicketsToBuy, setNumberOfTicketsToBuy] = useState("0");

  const {
    name,
    endsAt,
    totalTicketCount,
    priceInGoods,
    imgSrc,
    id,
    soldTicketCount,
  } = raffle;

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      const res = await axios.get<CountResponse>(GET_ENTRIES_BY_WALLET, {
        params: {
          raffleId: id,
          walletAddress: publicKey?.toString(),
        },
      });
      console.log("req", {
        raffleId: id,
        walletAddress: publicKey?.toString(),
      });
      console.log("res", res.data.count);

      setEntryCount(res.data.count);
      setSoldCount(soldTicketCount);
    } catch (error) {
      console.error(error);
    }
  }, [id, publicKey, soldTicketCount]);

  const handleUpdateCounts = (
    updatedCount: number,
    updatedSoldCount: number
  ) => {
    debugger;
    setSoldCount(updatedSoldCount);
    setEntryCount(updatedCount);
  };

  useEffect(() => {
    fetchData();
    setRaffleIsOver(dayjs().isAfter(dayjs(endsAt)));
  }, [fetchData, endsAt]);

  return (
    <div
      className="w-full p-4 bg-amber-200 space-y-2 flex-shrink-0 rounded-lg flex flex-col justify-between"
      style={{ backgroundImage: `url(${bg.src})` }}
    >
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height={250}
          width={250}
          src={imgSrc}
          alt="raffle item"
          className="w-full object-cover lg:max-h-[280px] mb-2"
        />
        <div className="text-2xl font-bold py-1">{name}</div>
        <div>
          <div className="text-lg text-green-800 font-semibold">
            {dayjs().isAfter(dayjs(endsAt)) ? "Ended" : "Ends in"}
          </div>
          <div className="text-lg font-bold">
            {dayjs(Date.now()).to(endsAt).replace("in ", "")}
          </div>
        </div>
        <div>
          <div className="text-lg text-green-800 font-semibold">
            Your tickets
          </div>
          <div className="text-lg font-bold">
            {" "}
            {entryCount ? entryCount : 0}
          </div>
        </div>
        <div>
          <div className="text-lg text-green-800 font-semibold">
            Tickets Sold
          </div>
          <div className="text-lg font-bold">{soldCount}</div>
        </div>
        <div>
          <div className="text-lg text-green-800 font-semibold">
            Total Tickets
          </div>
          <div className="text-lg font-bold">{totalTicketCount}</div>
        </div>
        <div>
          <div className="text-lg text-green-800 font-semibold">
            Ticket Price
          </div>
          <div className="text-lg font-bold">{priceInGoods} $GOODS</div>
        </div>
      </div>
      <div>
        {!raffleIsOver && !(totalTicketCount === soldCount) && (
          <div>
            <div className="text-lg text-green-800 font-semibold mb-1">
              Number of Tickets
            </div>
            <input
              className="w-full p-2 rounded"
              value={numberOfTicketsToBuy}
              max={totalTicketCount - soldCount}
              min={0}
              type="number"
              onChange={(event) => setNumberOfTicketsToBuy(event.target.value)}
            />
          </div>
        )}
        <div className="pt-3">
          <SendTransaction
            raffle={raffle}
            raffleIsOver={raffleIsOver}
            entryCount={entryCount}
            numberOfTicketsToBuy={numberOfTicketsToBuy}
            setNumberOfTicketsToBuy={setNumberOfTicketsToBuy}
            handleUpdateCounts={handleUpdateCounts}
          />
        </div>
      </div>
    </div>
  );
};

export default RaffleListItem;
