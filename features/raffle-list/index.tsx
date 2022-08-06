import RaffleListItem from "features/raffle-list/raffle-list-item";
import { Raffle } from "types/types";

import Image from "next/image";

const RaffleList = ({ raffles }: { raffles: Raffle[] }) => {
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
      {!!raffles.length ? (
        raffles
          ?.filter((raffle) => !raffle.isArchived)
          .map((raffle: Raffle) => (
            <RaffleListItem key={raffle.id} raffle={raffle} />
          ))
      ) : (
        <Image
          className="animate-spin"
          src="/images/loader.svg"
          height={30}
          width={30}
          alt="Loading"
        />
      )}
    </div>
  );
};

export default RaffleList;
