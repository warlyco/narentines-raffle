import RaffleListItem from "features/raffle-list/raffle-list-item";
import { GET_RAFFLES } from "api/raffles/endpoints";
import { useCallback, useEffect, useState } from "react";
import { Raffle, RafflesResponse } from "types/types";
import axios from "axios";

const RaffleList = () => {
  const [raffles, setRaffles] = useState<Raffle[] | null>(null);
  const [isLoading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (raffles?.length) return;
    try {
      setLoading(true);
      const { data } = await axios.get<RafflesResponse>(GET_RAFFLES);

      setRaffles(data.raffles);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [raffles?.length]);

  useEffect(() => {
    try {
      if (!raffles?.length) fetchData();
    } catch (error: any) {
      console.error(error);
    }
  }, [fetchData, raffles?.length]);

  if (isLoading)
    return (
      <div className="text-4xl font-bold animate-pulse text-center w-full py-8">
        LOADING
      </div>
    );

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
