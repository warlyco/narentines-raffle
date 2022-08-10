import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import {
  ArchiveRaffleResponse,
  Raffle,
  RaffleEntry,
  RaffleWinnerResponse,
  RaffleWinnersResponse,
  SplTokens,
} from "types/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { SendTransaction } from "features/solana/send-transaction";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import bg from "public/images/single-item-bg.png";

import axios from "axios";
import {
  ADD_RAFFLE_WINNER,
  ADD_RAFFLE_WINNERS,
  ARCHIVE_RAFFLE,
  GET_ENTRIES_BY_RAFFLE_ID,
} from "api/raffles/endpoints";
import toast from "react-hot-toast";
import Image from "next/image";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import classNames from "classnames";
import { useLazyQuery, useQuery } from "@apollo/client";
import GET_ENTRIES_BY_WALLET from "graphql/queries/get-entries-by-wallet";
import { TicketPrice } from "./ticket-price";
import Spinner from "features/UI/Spinner";
import { selectWinner, selectWinners } from "utils/pick-winner";
import { useCountdown } from "hooks/use-countdown";
import CountdownTimer from "features/countdown/countdown-timer";

const SwalReact = withReactContent(Swal);

dayjs.extend(relativeTime);

type Props = {
  raffle: Raffle;
};

export const RaffleListItem = ({ raffle }: Props) => {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [isAdmin, setIsAdmin] = useState(false);
  const [pickingWinner, setPickingWinner] = useState(false);
  const [raffleIsOver, setRaffleIsOver] = useState(false);
  const [numberOfTicketsToBuy, setNumberOfTicketsToBuy] = useState("0");
  const [sendTransactionKey, setSendTransactionKey] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<SplTokens | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<SplTokens[] | null>(
    null
  );
  const [entryCount, setEntryCount] = useState<number | undefined>(undefined);
  const [winner, setWinner] = useState("");

  const {
    name,
    endsAt,
    totalTicketCount,
    priceInGoods,
    priceInSol,
    imgSrc,
    id,
    totalWinnerCount,
    winners,
    projectWebsiteUrl,
    projectTwitterUrl,
    projectDiscordUrl,
    priceInDust,
  } = raffle;

  const handleCompleteTransaction = () => {
    setSendTransactionKey(sendTransactionKey + 1);
  };

  const selectSingleWinner = async (entries: RaffleEntry[]) => {
    const winnerWalletAddress = selectWinner(entries);
    debugger;
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
        <div className="flex bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
          <div className="font-bold">Winner selected!&nbsp;</div>
          <div>{winner}</div>
        </div>
      );
      setWinner(winner);
    } catch (error) {
      toast.custom(
        <div className="flex bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
          <div className="font-bold">
            There was an error selecting winner.&nbsp;
          </div>
          <div>Please refresh and try again.</div>
        </div>
      );
      console.error(error);
    } finally {
      setPickingWinner(false);
    }
  };

  const displayWinners = (winners: string[]) => {
    SwalReact.fire({
      title: `${raffle.name} Winners!`,
      html: (
        <div>
          {winners.map((winner, i) => {
            return (
              <div className="truncate" key={i}>
                {winner}
              </div>
            );
          })}
        </div>
      ),
      confirmButtonText: "Close",
    });
  };

  const selectMultipleWinners = async (entries: RaffleEntry[]) => {
    const winnerWalletAddresses = selectWinners({
      entries,
      numberOfWinnersToPick: totalWinnerCount,
    });
    try {
      const { data } = await axios.post<RaffleWinnersResponse>(
        ADD_RAFFLE_WINNERS,
        {
          id,
          winnerWalletAddresses,
        }
      );
      const { winners } = data;
      displayWinners(winners);

      setWinner("Multiple Winners!");
    } catch (error) {
      toast.custom(
        <div className="flex bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
          <div className="font-bold">
            There was an error selecting winners.&nbsp;
          </div>
          <div>Please refresh and try again.</div>
        </div>
      );
      console.error(error);
    } finally {
      setPickingWinner(false);
    }
  };

  const fetchRaffleEntries = async () => {
    const res = await axios.get(GET_ENTRIES_BY_RAFFLE_ID, {
      params: {
        id,
      },
    });
    const { entries } = res.data;
    return entries;
  };

  const handleSelectWinner = async () => {
    // if (winner || winners.length) return;
    setPickingWinner(true);
    const entries = await fetchRaffleEntries();

    if (totalWinnerCount > 1) {
      selectMultipleWinners(entries);
    } else {
      selectSingleWinner(entries);
    }
  };

  const handleArchiveRaffle = async () => {
    try {
      const { data } = await axios.post<ArchiveRaffleResponse>(ARCHIVE_RAFFLE, {
        id,
      });
      const { name } = data;

      toast.custom(
        <div className="flex bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
          <div className="font-bold">Raffle Archived!&nbsp;</div>
          <div>{name}</div>
        </div>
      );
    } catch (error) {
      toast.custom(
        <div className="flex bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
          <div className="font-bold">There was a problem archiving.&nbsp;</div>
          <div>Please refresh and try again.</div>
        </div>
      );
    }
  };

  const handleUpdatePaymentMethod = async (
    ev: ChangeEvent<HTMLSelectElement>
  ) => {
    setPaymentMethod(ev.target.value as SplTokens);
  };

  const [handleFetchEntries, { loading, data: entryRes, refetch }] =
    useLazyQuery(GET_ENTRIES_BY_WALLET, {
      variables: {
        walletAddress: publicKey?.toString(),
        raffleId: raffle.id,
      },
    });

  const handleUpdateCounts = async () => {
    refetch();
    setSoldCount(soldCount + parseInt(numberOfTicketsToBuy));
    setNumberOfTicketsToBuy(String(0));
  };

  const fetchEntries = useCallback(async () => {
    await handleFetchEntries();
    let count = entryRes?.entries?.[0]?.count;
    if (count) {
      setEntryCount(count);
    } else {
      setEntryCount(0);
    }
  }, [entryRes?.entries, handleFetchEntries]);

  const handleSetInitialPaymentMethood = useCallback(() => {
    if (raffle.priceInSol) {
      setPaymentMethod(SplTokens.SOL);
    } else if (raffle.priceInGoods) {
      setPaymentMethod(SplTokens.GOODS);
    } else if (raffle.priceInDust) {
      setPaymentMethod(SplTokens.DUST);
    }
  }, [raffle]);

  const handleSetInitialPaymentMethoods = useCallback(() => {
    let paymentMethods = [];
    if (raffle.priceInSol) {
      paymentMethods.push(SplTokens.SOL);
    }
    if (raffle.priceInGoods) {
      paymentMethods.push(SplTokens.GOODS);
    }
    if (raffle.priceInDust) {
      paymentMethods.push(SplTokens.DUST);
    }
    setPaymentMethods(paymentMethods);
  }, [raffle]);

  useEffect(() => {
    if (raffle.winner) setWinner(raffle.winner);
    setRaffleIsOver(dayjs().isAfter(dayjs(endsAt)));
    if (publicKey) {
      fetchEntries();
      handleSetInitialPaymentMethood();
      handleSetInitialPaymentMethoods();
      setIsAdmin(
        process.env.NEXT_PUBLIC_ADMIN_WALLETS!.indexOf(publicKey.toString()) >
          -1
      );
    } else {
      setIsAdmin(false);
    }
    if (raffle.soldTicketCount > soldCount) {
      setSoldCount(raffle.soldTicketCount);
    }
  }, [
    endsAt,
    publicKey,
    raffle.winner,
    raffle.soldTicketCount,
    handleFetchEntries,
    fetchEntries,
    soldCount,
    handleSetInitialPaymentMethood,
    handleSetInitialPaymentMethoods,
  ]);

  return (
    <div
      className="w-full p-4 bg-amber-200 space-y-2 flex-shrink-0 rounded-lg flex flex-col justify-between relative deep-shadow"
      style={{ backgroundImage: `url(${bg.src})` }}
    >
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height={250}
          width={250}
          src={imgSrc}
          alt="raffle item"
          className={classNames({
            "w-full object-cover lg:max-h-[280px] mb-2 bg-gray-400": true,
          })}
        />
        <div className="text-2xl font-bold py-1">{name}</div>
        <div className="flex w-full py-1 space-x-3">
          {!!projectWebsiteUrl?.length && (
            <a
              className="block"
              href={
                projectWebsiteUrl.startsWith("http://") ||
                projectWebsiteUrl.startsWith("https://")
                  ? projectWebsiteUrl
                  : `//${projectWebsiteUrl}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                height={18}
                width={20}
                src="/images/globe.svg"
                alt="Twitter"
                className="cursor-pointer"
              />
            </a>
          )}
          {!!projectTwitterUrl?.length && (
            <a
              href={projectTwitterUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                height={18}
                width={20}
                src="/images/twitter-black.svg"
                alt="Twitter"
                className="cursor-pointer"
              />
            </a>
          )}
          {!!projectDiscordUrl?.length && (
            <a
              href={projectDiscordUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                height={18}
                width={20}
                src="/images/discord-black.svg"
                alt="Twitter"
                className="cursor-pointer"
              />
            </a>
          )}
        </div>
        <div>
          <div className="text-lg text-green-800 font-semibold">
            {dayjs().isAfter(dayjs(endsAt)) ? "Ended" : "Ends in"}
          </div>
          <div className="text-lg font-bold">
            {dayjs().isAfter(dayjs(endsAt)) ? (
              dayjs(Date.now()).to(endsAt).replace("in ", "")
            ) : (
              <CountdownTimer endsAt={endsAt} />
            )}
          </div>
        </div>
        {publicKey && (
          <div>
            <div className="text-lg text-green-800 font-semibold">
              Your tickets
            </div>
            <div className="text-lg font-bold">
              {loading || entryCount === undefined ? (
                <Spinner />
              ) : (
                <span>{String(entryCount)}</span>
              )}
            </div>
          </div>
        )}
        <div>
          <div className="text-lg text-green-800 font-semibold">
            Tickets Sold
          </div>
          <div className="text-lg font-bold">
            {soldCount > totalTicketCount ? totalTicketCount : soldCount}
          </div>
        </div>
        <div>
          <div className="text-lg text-green-800 font-semibold">
            Total Tickets
          </div>
          <div className="text-lg font-bold">{totalTicketCount}</div>
        </div>
        {!loading && paymentMethods?.length && paymentMethod && (
          <TicketPrice
            handleUpdatePaymentMethod={handleUpdatePaymentMethod}
            prices={{ priceInDust, priceInGoods, priceInSol }}
            paymentMethod={paymentMethod}
            paymentMethods={paymentMethods}
            winner={winner}
            winners={winners}
          />
        )}
        <div>
          <div className="text-lg text-green-800 font-semibold">
            Amount of Winners
          </div>
          <div className="text-lg font-bold">{totalWinnerCount}</div>
        </div>
      </div>
      <div>
        {!raffleIsOver && !(totalTicketCount <= soldCount) && publicKey && (
          <div>
            <div className="text-lg text-green-800 font-semibold mb-1">
              Number of Tickets
            </div>
            <input
              className="w-full p-2 rounded funt-bold text-2xl border border-green-600 bg-slate-50 shadow-sm"
              value={numberOfTicketsToBuy}
              max={totalTicketCount - soldCount}
              min={0}
              type="number"
              onChange={(event) => setNumberOfTicketsToBuy(event.target.value)}
            />
          </div>
        )}
        {(winner || winners?.length) && (
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
            handleCompleteTransaction={handleCompleteTransaction}
            key={sendTransactionKey}
            raffle={raffle}
            raffleIsOver={raffleIsOver}
            raffleIsSoldOut={totalTicketCount <= soldCount}
            entryCount={entryCount || 0}
            numberOfTicketsToBuy={numberOfTicketsToBuy}
            winner={winner}
            winners={winners}
            handleUpdateCounts={handleUpdateCounts}
            paymentMethod={paymentMethod}
          />
        </div>
        {isAdmin &&
          (raffleIsOver || totalTicketCount <= soldCount) &&
          !winner &&
          !winners?.length && (
            <div className="pt-3">
              <button
                className="w-full p-2 rounded bg-green-800 text-white uppercase text-xl pt-2.5"
                onClick={handleSelectWinner}
                disabled={pickingWinner}
              >
                {pickingWinner
                  ? "..."
                  : totalWinnerCount > 1
                  ? "Select Winners"
                  : "Select Winner"}
              </button>
            </div>
          )}
        {isAdmin && (raffleIsOver || totalTicketCount <= soldCount) && (
          <div className="pt-3">
            <button
              className="w-full p-2 rounded bg-green-800 text-white uppercase text-xl pt-2.5"
              onClick={handleArchiveRaffle}
              disabled={pickingWinner}
            >
              Archive
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaffleListItem;
