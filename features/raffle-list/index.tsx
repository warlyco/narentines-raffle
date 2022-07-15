import RaffleListItem from "features/raffle-list/raffle-list-item";

const items = [
  {
    imgSrc: "https://www.fillmurray.com/250/250",
    name: "Name of NFT",
    endTime: "1 day, 2 hours",
    totalTicketCount: 4200,
    totalSoldTicketCount: 420,
    totalUserTicketCount: 4,
    pricePerTicketInGoods: 2,
  },
];

export const RaffleList = () => {
  return (
    <div className="grid grid-cols-3 gap-8">
      {items.map((item, i) => (
        <RaffleListItem key={i} item={item} />
      ))}
    </div>
  );
};
