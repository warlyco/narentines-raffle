import { useQuery, gql } from "@apollo/client";
import RaffleListItem from "features/raffle-list/raffle-list-item";
import { Raffle } from "types/types";

const QUERY = gql`
  query Raffles {
    raffles(order_by: { endsAt: desc }) {
      id
      name
      mintAddress
      endsAt
      createdAt
      startsAt
      updatedAt
      totalTicketCount
      soldTicketCount
      priceInGoods
      imgSrc
    }
  }
`;

const RaffleList = () => {
  const { data, loading, error, refetch } = useQuery(QUERY);

  if (loading) {
    return (
      <div className="text-4xl font-bold animate-pulse text-center w-full py-8">
        LOADING
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-4xl font-bold animate-pulse text-center w-full py-8">
        There was an error. Please refresh.
      </div>
    );
  }

  const { raffles } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 -mt-2">
      {!!raffles &&
        raffles?.map((raffle: Raffle) => (
          <RaffleListItem key={raffle.id} raffle={raffle} refetch={refetch} />
        ))}
    </div>
  );
};

export default RaffleList;
