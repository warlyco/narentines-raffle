import RaffleListItem from "features/raffle-list/raffle-list-item";
import { Balances, Raffle } from "types/types";

import Image from "next/image";
import Spinner from "features/UI/Spinner";
import { isProduction } from "constants/constants";
import { GET_RAFFLES } from "graphql/queries/get-raffles";
import { GET_TEST_RAFFLES } from "graphql/queries/get-test-raffles";
import { useQuery } from "@apollo/client";
import LoadingRaffleCard from "./loading-raffle-card";

type Props = {
  setIsSendingTransaction: (isSendingTransaction: boolean) => void;
  userBalances: Balances | null;
};

const RaffleList = ({ setIsSendingTransaction, userBalances }: Props) => {
  const query = isProduction ? GET_RAFFLES : GET_TEST_RAFFLES;
  const { loading, data, refetch } = useQuery(query);

  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 -mt-2 mb-8">
        <LoadingRaffleCard />
        <LoadingRaffleCard />
        <LoadingRaffleCard />
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 -mt-2 mb-8">
      {!!data?.raffles.length ? (
        data.raffles
          ?.filter((raffle: Raffle) => !raffle.isArchived)
          .map((raffle: Raffle) => (
            <RaffleListItem
              userBalances={userBalances}
              key={raffle.id}
              raffle={raffle}
              setIsSendingTransaction={setIsSendingTransaction}
            />
          ))
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default RaffleList;
