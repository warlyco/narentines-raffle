import { useMutation } from "@apollo/client";
import classNames from "classnames";
import { MouseEvent, useState } from "react";
import { ADD_RAFFLE } from "graphql/mutations/add-raffle";

const AdminPanel = () => {
  const [walletAddressInputValue, setWalletAddressInputValue] =
    useState<string>("");
  const [nftMintAddress, setNftMintAddress] = useState<string>("");
  const [nftName, setNftName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [endDateTime, setEndDateTime] = useState<string>("");
  const [startDateTime, setStartDateTime] = useState<string>("");
  const [imgUrl, setImgUrl] = useState<string>("");
  const [pricePerTicketInGoods, setPricePerTicketInGoods] =
    useState<string>("3");
  const [totalTicketCount, setTotalTicketCount] = useState<string>("500");

  const [addRaffle, { data, loading, error }] = useMutation(ADD_RAFFLE);

  const handleAddRaffle = (e: MouseEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      addRaffle({
        variables: {
          endsAt: endDateTime,
          startsAt: startDateTime,
          imgSrc: imgUrl,
          mintAddress: nftMintAddress,
          name: nftName,
          priceInGoods: parseInt(pricePerTicketInGoods),
          totalTicketCount: parseInt(totalTicketCount),
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto pt-24">
      <h1 className="text-2xl mb-2">Add Raffle</h1>
      <form className="space-y-4">
        <div>
          <label htmlFor="mint-address" className="flex space-x-4 items-center">
            <div className="whitespace-nowrap">NFT Mint Address</div>
            <input
              disabled={false}
              className="border p-1 w-full"
              value={nftMintAddress}
              onChange={(e) => setNftMintAddress(e.target.value)}
            />
          </label>
          <label htmlFor="nft-name" className="flex space-x-4 items-center">
            <div className="whitespace-nowrap">NFT Name</div>
            <input
              disabled={false}
              className="border p-1 w-full"
              value={nftName}
              onChange={(e) => setNftName(e.target.value)}
            />
          </label>
          <label htmlFor="nft-image" className="flex space-x-4 items-center">
            <div className="whitespace-nowrap">Image url</div>
            <input
              disabled={false}
              className="border p-1 w-full"
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
            />
          </label>
          <label htmlFor="start-time" className="flex space-x-4 items-center">
            <div className="whitespace-nowrap">Starts at</div>
            <input
              type="datetime-local"
              disabled={false}
              className="border p-1 w-full"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
            />
          </label>
          <label htmlFor="end-time" className="flex space-x-4 items-center">
            <div className="whitespace-nowrap">Ends at</div>
            <input
              type="datetime-local"
              disabled={false}
              className="border p-1 w-full"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
            />
          </label>
          <label htmlFor="price" className="flex space-x-4 items-center">
            <div className="whitespace-nowrap">Price (in $GOODS)</div>
            <input
              type="number"
              disabled={false}
              className="border p-1 w-full"
              value={pricePerTicketInGoods}
              onChange={(e) => setPricePerTicketInGoods(e.target.value)}
            />
          </label>
          <label
            htmlFor="total-tickets"
            className="flex space-x-4 items-center"
          >
            <div className="whitespace-nowrap">Total tickets</div>
            <input
              type="number"
              disabled={false}
              className="border p-1 w-full"
              value={totalTicketCount}
              onChange={(e) => setTotalTicketCount(e.target.value)}
            />
          </label>
          <button
            onClick={(e) => handleAddRaffle(e)}
            className={classNames({
              "p-4 py-2 rounded border shadow": true,
              "bg-slate-400 animate-pulse": isLoading,
              "cursor-pointer": !isLoading,
            })}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPanel;
