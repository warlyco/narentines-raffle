import RaffleListItem from "features/raffle-list/raffle-list-item";
import { GET_RAFFLES } from "api/raffles/endpoints";
import { useCallback, useEffect, useState } from "react";
import { Raffle, RafflesResponse } from "types/types";
import axios from "axios";
import LoadingRaffleCard from "./loading-raffle-card";
import toast from "react-hot-toast";

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
      toast.custom(
        <div className="flex flex-col bg-white rounded-xl shadow-lg p-3 border-slate-400 text-center">
          <div className="font-bold">There was an error loading data.</div>
          <div>Please refresh and try again.</div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  }, [raffles?.length]);

  useEffect(() => {
    if (!raffles?.length) fetchData();
  }, [fetchData, raffles?.length]);

  if (isLoading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 -mt-2 mb-8">
        <LoadingRaffleCard />
        <LoadingRaffleCard />
        <LoadingRaffleCard />
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
