import Image from "next/image";

export const RaffleListItem = () => {
  return (
    <div className="flex flex-col w-full p-3 bg-amber-200 border-black border-2 space-y-2">
      <Image
        height={250}
        width={250}
        src="https://www.fillmurray.com/250/250"
        alt="raffle item"
      />
      <div className="text-2xl font-bold">Name of NFT</div>
      <div>
        <div className="text-lg text-green-800 font-semibold">Ends in</div>
        <div className="text-lg font-bold">Name of NFT</div>
      </div>
      <div>
        <div className="text-lg text-green-800 font-semibold">Sold Tickets</div>
        <div className="text-lg font-bold">42</div>
      </div>
      <div>
        <div className="text-lg text-green-800 font-semibold">
          Total Tickets
        </div>
        <div className="text-lg font-bold">4200</div>
      </div>
      <div className="pb-3">
        <div className="text-lg text-green-800 font-semibold">Ticket Price</div>
        <div className="text-lg font-bold">42 $GOODS</div>
      </div>
      <button className="w-full py-3 bg-red-600 text-amber-200 uppercase rounded-lg">
        Join Raffle
      </button>
    </div>
  );
};

export default RaffleListItem;
