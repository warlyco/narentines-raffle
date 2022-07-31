import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { Raffle, RaffleWinnerResponse } from "types/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { SendTransaction } from "features/solana/send-transaction";
import { useCallback, useEffect, useState } from "react";
import bg from "public/images/single-item-bg.png";

import axios from "axios";
import {
  ADD_RAFFLE_WINNER,
  GET_ENTRIES_BY_RAFFLE_ID,
  GET_ENTRIES_BY_WALLET,
} from "api/raffles/endpoints";
import toast from "react-hot-toast";
import Image from "next/image";

dayjs.extend(relativeTime);

type RaffleEntry = {
  walletAddress: string;
  count: number;
};

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [pickingWinner, setPickingWinner] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [raffleIsOver, setRaffleIsOver] = useState(false);
  const [numberOfTicketsToBuy, setNumberOfTicketsToBuy] = useState("0");
  const [winner, setWinner] = useState("");

  const {
    name,
    endsAt,
    totalTicketCount,
    priceInGoods,
    imgSrc,
    id,
    soldTicketCount,
    totalWinnerCount,
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
    setSoldCount(updatedSoldCount);
    setEntryCount(updatedCount);
  };

  const handleSelectWinner = async () => {
    setPickingWinner(true);
    const res = await axios.get(GET_ENTRIES_BY_RAFFLE_ID, {
      params: {
        id,
      },
    });
    const { entries } = res.data;
    let contestants = [];
    for (const entry of entries) {
      for (let i = 0; i < entry.count; i++) {
        contestants.push(entry.walletAddress);
      }
    }

    const randomContenstantIndex = Math.floor(
      Math.random() * contestants.length
    );
    const winnerWalletAddress = contestants[randomContenstantIndex];
    try {
      const { data } = await axios.post<RaffleWinnerResponse>(
        ADD_RAFFLE_WINNER,
        {
          id,
          winnerWalletAddress,
        }
      );
      const { winner } = data;

      toast.custom(
        <div className="flex flex-col bg-white rounded-xl shadow-lg p-3 border-slate-400 text-center">
          <div className="font-bold">Winner selected!</div>
          <div>{winner}</div>
        </div>
      );
      setWinner(winner);
    } catch (error) {
      console.error(error);
    } finally {
      setPickingWinner(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (raffle.winner) setWinner(raffle.winner);
    setRaffleIsOver(dayjs().isAfter(dayjs(endsAt)));
    setIsAdmin(
      process.env.NEXT_PUBLIC_ADMIN_WALLETS!.indexOf(publicKey!.toString()) > -1
    );
  }, [fetchData, endsAt, publicKey, raffle.winner]);

  return (
    <div
      className="w-full p-4 bg-amber-200 space-y-2 flex-shrink-0 rounded-lg flex flex-col justify-between relative"
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
        <div>
          <div className="text-lg text-green-800 font-semibold">
            Amount of Winners
          </div>
          <div className="text-lg font-bold">{totalWinnerCount}</div>
        </div>
      </div>
      <div>
        {!raffleIsOver && !(totalTicketCount <= soldCount) && (
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
        {winner && (
          <div className="absolute -right-8 bottom-12 -rotate-[21.03deg]">
            <Image
              src="/images/loot-icon.png"
              width="164.84px"
              height="131.88px"
              alt="loot icon"
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
            winner={winner}
          />
        </div>
        {isAdmin && (raffleIsOver || totalTicketCount <= soldCount) && !winner && (
          <div className="pt-3">
            <button
              className="w-full p-2 rounded bg-green-800 text-white uppercase"
              onClick={handleSelectWinner}
              disabled={pickingWinner}
            >
              {pickingWinner ? "..." : "Select Winner"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaffleListItem;
