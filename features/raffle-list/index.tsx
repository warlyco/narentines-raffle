import RaffleListItem from "features/raffle-list/raffle-list-item";

export const RaffleList = () => {
  return (
    <div className="grid grid-cols-3 gap-8">
      <RaffleListItem />
      <RaffleListItem />
      <RaffleListItem />
      <RaffleListItem />
      <RaffleListItem />
    </div>
  );
};
