import { useWallet } from "@solana/wallet-adapter-react";
import { divide } from "lodash";
import { ChangeEvent } from "react";
import { SplTokens } from "types/types";

type Price = {
  priceInSol: number;
  priceInDust: number;
  priceInGoods: number;
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
};

export const TicketPrice = ({
  paymentMethod,
  paymentMethods,
  winner,
  winners,
  prices,
  raffleIsOver,
  handleUpdatePaymentMethod,
}: Props) => {
  const { publicKey } = useWallet();
  const { priceInSol, priceInDust, priceInGoods } = prices;
  const { SOL, DUST, GOODS } = SplTokens;
  const getPrice = (paymentMethod: SplTokens) => {
    switch (paymentMethod) {
      case SOL:
        return priceInSol;
      case DUST:
        return priceInDust;
      case GOODS:
        return priceInGoods;
    }
  };

  const getPriceDisplay = () => {
    switch (paymentMethod) {
      case SOL:
        return <div className="text-lg font-bold">{priceInSol} SOL</div>;
      case DUST:
        return <div className="text-lg font-bold">{priceInDust} $DUST</div>;
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
    <div>
      <label>
        <div className="text-lg text-green-800 font-semibold">Ticket Price</div>
        {paymentMethods?.length === 1 ? (
          getPriceDisplay()
        ) : winner || winners?.length || raffleIsOver || !publicKey ? (
          getTicketPriceList()
        ) : (
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
        )}
      </label>
    </div>
  );
};
