import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ChangeEvent, useEffect } from "react";
import { Balances, SplTokens } from "types/types";

type Price = {
  priceInSol: number;
  priceInDust: number;
  priceInGoods: number;
  priceInForge: number;
  priceInGear: number;
};

type Props = {
  raffleIsOver: boolean;
  prices: Price;
  paymentMethod: SplTokens;
  paymentMethods: SplTokens[];
  winner: string;
  winners: string[];
  handleUpdatePaymentMethod: (
    ev: ChangeEvent<HTMLSelectElement>
  ) => Promise<void>;
  userBalances: Balances | null;
};

export const TicketPrice = ({
  paymentMethod,
  paymentMethods,
  winner,
  winners,
  prices,
  raffleIsOver,
  handleUpdatePaymentMethod,
  userBalances,
}: Props) => {
  const { publicKey } = useWallet();
  const { priceInSol, priceInDust, priceInGoods, priceInForge, priceInGear } =
    prices;
  const { SOL, DUST, GOODS, FORGE, GEAR } = SplTokens;

  const getPrice = (paymentMethod: SplTokens) => {
    switch (paymentMethod) {
      case SOL:
        return priceInSol;
      case DUST:
        return priceInDust;
      case GOODS:
        return priceInGoods;
      case FORGE:
        return priceInForge;
      case GEAR:
        return priceInGear;
    }
  };

  const getPriceDisplay = () => {
    switch (paymentMethod) {
      case SOL:
        return <div className="text-lg font-bold">{priceInSol} SOL</div>;
      case DUST:
        return <div className="text-lg font-bold">{priceInDust} $DUST</div>;
      case FORGE:
        return <div className="text-lg font-bold">{priceInForge} $FORGE</div>;
      case GEAR:
        return <div className="text-lg font-bold">{priceInGear} $GEAR</div>;
      case GOODS:
      default:
        return <div className="text-lg font-bold">{priceInGoods} $GOODS</div>;
    }
  };

  const getTicketPriceList = () => {
    return (
      <div className="flex flex-wrap text-lg leading-7 font-bold">
        {paymentMethods.map((method, i) => (
          <div key={method}>
            {getPrice(method)} {method !== SplTokens.SOL && "$"}
            {method}
            {i !== paymentMethods.length - 1 && (
              <span>&nbsp;&nbsp;||&nbsp;&nbsp;</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pt-2">
      <div className="text-lg text-green-800 font-semibold">Ticket Price</div>
      <div className="mb-2">
        {paymentMethods?.length === 1 ? (
          getPriceDisplay()
        ) : winner || winners?.length || raffleIsOver || !publicKey ? (
          getTicketPriceList()
        ) : (
          <label>
            <select
              className="text-lg font-bold rounded mb-2 w-full bg-slate-50 p-1"
              value={String(paymentMethod)}
              onChange={handleUpdatePaymentMethod}
            >
              {paymentMethods?.map((method) => (
                <option value={method} key={method}>
                  {getPrice(method)} {method !== SplTokens.SOL && "$"}
                  {method}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {!!userBalances && !raffleIsOver && (
        <div className="flex justify-between">
          <div className="w-1/2">
            <div className="text-lg text-green-800 font-semibold">
              Your {paymentMethod}
            </div>
            <div className="text-lg font-bold">
              {userBalances[paymentMethod] || 0}
            </div>
          </div>
          <div className="w-1/2">
            <div className="text-lg text-green-800 font-semibold">
              Purchasable
            </div>
            <div className="text-lg font-bold">
              {userBalances[paymentMethod]
                ? Math.floor(
                    Number(userBalances[paymentMethod]) /
                      getPrice(paymentMethod)
                  )
                : 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
