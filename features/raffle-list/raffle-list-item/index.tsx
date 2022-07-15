import Image from "next/image";

type Props = {
  item: any;
};

export const RaffleListItem = ({ item }: Props) => {
  const {
    name,
    endTime,
    totalTicketCount,
    totalUserTicketCount,
    totalSoldTicketCount,
    pricePerTicketInGoods,
    imgSrc,
  } = item;
  return (
    <div className="flex flex-col w-full p-3 bg-amber-200 border-black border-2 space-y-2">
      <Image height={250} width={250} src={imgSrc} alt="raffle item" />
      <div>
        <div className="text-lg text-green-800 font-semibold">Ends in</div>
        <div className="text-lg font-bold">{endTime}</div>
      </div>
      <div>
        <div className="text-lg text-green-800 font-semibold">Your tickets</div>
        <div className="text-lg font-bold">{totalUserTicketCount}</div>
      </div>
      <div>
        <div className="text-lg text-green-800 font-semibold">Sold Tickets</div>
        <div className="text-lg font-bold">{totalSoldTicketCount}</div>
      </div>
      <div>
        <div className="text-lg text-green-800 font-semibold">
          Total Tickets
        </div>
        <div className="text-lg font-bold">{totalTicketCount}</div>
      </div>
      <div className="pb-3">
        <div className="text-lg text-green-800 font-semibold">Ticket Price</div>
        <div className="text-lg font-bold">{pricePerTicketInGoods} $GOODS</div>
      </div>
      <button className="w-full py-3 bg-red-600 text-amber-200 uppercase rounded-lg">
        Join Raffle
      </button>
    </div>
  );
};

export default RaffleListItem;
