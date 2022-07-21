import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Image from "next/image";
import { Raffle } from "types/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { RequestAirdrop } from "features/solana/request-air-drop";
import { SendTransaction } from "features/solana/send-transaction";
import { useEffect, useState } from "react";
import gql from "graphql-tag";
import { ApolloQueryResult, useQuery } from "@apollo/client";
import bg from "public/images/single-item-bg.png";

dayjs.extend(relativeTime);

type Props = {
  raffle: Raffle;
  refetch: () => Promise<ApolloQueryResult<any>>;
};

const QUERY = gql`
  query Entries($walletAddress: String, $raffleId: uuid) {
    entries(
      where: {
        walletAddress: { _eq: $walletAddress }
        raffleId: { _eq: $raffleId }
      }
    ) {
      count
    }
  }
`;

export const RaffleListItem = ({ raffle, refetch }: Props) => {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [entryCount, setEntryCount] = useState(0);
  const [raffleIsOver, setRaffleIsOver] = useState(false);
  const [numberOfTicketsToBuy, setNumberOfTicketsToBuy] = useState("0");

  const {
    data,
    loading: countLoading,
    error,
  } = useQuery(QUERY, {
    variables: {
      walletAddress: publicKey?.toString(),
      raffleId: raffle.id,
    },
  });

  const {
    id,
    name,
    endsAt,
    totalTicketCount,
    soldTicketCount,
    priceInGoods,
    imgSrc,
  } = raffle;

  useEffect(() => {
    setRaffleIsOver(dayjs().isAfter(dayjs(endsAt)));
    if (data?.entries?.[0]?.count) {
      setEntryCount(data.entries[0].count);
    }
  }, [
    data?.entries,
    endsAt,
    entryCount,
    raffle.endsAt,
    raffle.totalTicketCount,
  ]);

  return (
    <div
      className="h-fit w-full p-3 bg-amber-200 border-black border-2 space-y-2 flex-shrink-0"
      style={{ backgroundImage: `url(${bg.src})` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height={250}
        width={250}
        src={imgSrc}
        alt="raffle item"
        className="w-full"
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
        <div className="text-lg text-green-800 font-semibold">Your tickets</div>
        <div className="text-lg font-bold"> {entryCount ? entryCount : 0}</div>
      </div>
      <div>
        <div className="text-lg text-green-800 font-semibold">Tickets Sold</div>
        <div className="text-lg font-bold">{soldTicketCount}</div>
      </div>
      <div>
        <div className="text-lg text-green-800 font-semibold">
          Total Tickets
        </div>
        <div className="text-lg font-bold">{totalTicketCount}</div>
      </div>
      <div>
        <div className="text-lg text-green-800 font-semibold">Ticket Price</div>
        <div className="text-lg font-bold">{priceInGoods} $GOODS</div>
      </div>
      {!raffleIsOver && !(raffle.totalTicketCount === raffle.soldTicketCount) && (
        <div>
          <div className="text-lg text-green-800 font-semibold mb-1">
            Number of Tickets
          </div>
          <input
            className="w-full p-2 rounded"
            value={numberOfTicketsToBuy}
            max={totalTicketCount - soldTicketCount}
            min={0}
            type="number"
            onChange={(event) => setNumberOfTicketsToBuy(event.target.value)}
          />
        </div>
      )}
      <div className="pt-3">
        <SendTransaction
          refetch={refetch}
          raffle={raffle}
          raffleIsOver={raffleIsOver}
          entryCount={entryCount}
          numberOfTicketsToBuy={numberOfTicketsToBuy}
          setNumberOfTicketsToBuy={setNumberOfTicketsToBuy}
        />
      </div>
    </div>
  );
};

export default RaffleListItem;
