import RaffleListItem from "features/raffle-list/raffle-list-item";
import { Raffle } from "types/types";
import LoadingRaffleCard from "./loading-raffle-card";
import { useQuery } from "@apollo/client";
import { GET_RAFFLES } from "graphql/queries/get-raffles";

const RaffleList = ({ raffles }: { raffles: Raffle[] }) => {
  const { data, loading, error } = useQuery(GET_RAFFLES);

  // if (loading)
  //   return (
  //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 -mt-2 mb-8">
  //       <LoadingRaffleCard />
  //       <LoadingRaffleCard />
  //       <LoadingRaffleCard />
  //     </div>
  //   );

  // if (error) {
  //   return (
  //     <div className="text-4xl font-bold animate-pulse text-center w-full py-8">
  //       There was an error. Please refresh.
  //     </div>
  //   );
  // }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 -mt-2 mb-8">
      {!!raffles &&
        raffles
          ?.filter((raffle) => !raffle.isArchived)
          .map((raffle: Raffle) => (
            <RaffleListItem key={raffle.id} raffle={raffle} />
          ))}
    </div>
  );
};

export default RaffleList;
