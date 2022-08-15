import classNames from "classnames";
import { MouseEventHandler, useCallback, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { ADD_RAFFLE } from "api/raffles/endpoints";
import { Raffle, RaffleResponse, VercelJobResponse } from "types/types";
import dayjs from "dayjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { isProduction } from "constants/constants";

const AdminPanel = () => {
  const [walletAddressInputValue, setWalletAddressInputValue] =
    useState<string>("");
  const [nftMintAddress, setNftMintAddress] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTestRaffle, setIsTestRaffle] = useState<boolean>(false);
  const [endDateTime, setEndDateTime] = useState<string>("");
  const [startDateTime, setStartDateTime] = useState<string>("");
  const [imgUrl, setImgUrl] = useState<string>("");
  const [pricePerTicketInGoods, setPricePerTicketInGoods] =
    useState<string>("0");
  const [pricePerTicketInSol, setPricePerTicketInSol] = useState<string>("0");
  const [pricePerTicketInDust, setPricePerTicketInDust] = useState<string>("0");
  const [pricePerTicketInForge, setPricePerTicketInForge] =
    useState<string>("0");
  const [pricePerTicketInGear, setPricePerTicketInGear] = useState<string>("0");
  const [totalTicketCount, setTotalTicketCount] = useState<string>("500");
  const [totalWinnerCount, setTotalWinnerCount] = useState<string>("1");
  const [projectWebsiteUrl, setProjectWebsiteUrl] = useState<string>("");
  const [projectTwitterUrl, setProjectTwitterUrl] = useState<string>("");
  const [projectDiscordUrl, setProjectDiscordUrl] = useState<string>("");
  const [addedRaffle, setAddedRaffle] = useState<Raffle>({} as Raffle);

  const { publicKey, signMessage } = useWallet();

  const handleAddRaffle = useCallback(
    async (event: any) => {
      event.preventDefault();
      if (!signMessage || !publicKey) return;

      const message = "Confirm that you are an admin";
      const signature = await signMessage(new TextEncoder().encode(message));

      try {
        setIsLoading(true);
        const { data } = await axios.post<RaffleResponse>(ADD_RAFFLE, {
          name,
          isTestRaffle,
          imgSrc: imgUrl,
          mintAddress: nftMintAddress,
          endsAt: endDateTime,
          startsAt: dayjs().toISOString(),
          projectWebsiteUrl: projectWebsiteUrl
            .replace("https://", "")
            .replace("http://", ""),
          projectTwitterUrl: projectTwitterUrl
            .replace("https://", "")
            .replace("http://", ""),
          projectDiscordUrl: projectDiscordUrl
            .replace("https://", "")
            .replace("http://", ""),
          priceInGoods: parseInt(pricePerTicketInGoods),
          priceInSol: Number(pricePerTicketInSol),
          priceInDust: Number(pricePerTicketInDust),
          priceInForge: Number(pricePerTicketInForge),
          priceInGear: Number(pricePerTicketInGear),
          totalTicketCount: parseInt(totalTicketCount),
          totalWinnerCount: parseInt(totalWinnerCount),
          message,
          signature: JSON.stringify(signature),
          publicKey: JSON.stringify(publicKey.toBytes()),
          publicKeyString: publicKey.toString(),
        });
        setAddedRaffle(data.raffle);
        // clearForm();
        // const url = isProduction ? BUILD_HOOK : BUILD_HOOK_PREVIEW;

        toast("Raffle added successfully! It will be displayed shortly.");
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      endDateTime,
      imgUrl,
      isTestRaffle,
      name,
      nftMintAddress,
      pricePerTicketInDust,
      pricePerTicketInForge,
      pricePerTicketInGear,
      pricePerTicketInGoods,
      pricePerTicketInSol,
      projectDiscordUrl,
      projectTwitterUrl,
      projectWebsiteUrl,
      publicKey,
      signMessage,
      totalTicketCount,
      totalWinnerCount,
    ]
  );

  const clearForm = () => {
    setProjectWebsiteUrl("");
    setWalletAddressInputValue("");
    setNftMintAddress("");
    setName("");
    setEndDateTime("");
    setStartDateTime("");
    setImgUrl("");
    setPricePerTicketInGoods("0");
    setTotalTicketCount("500");
    setIsTestRaffle(false);
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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          {/* <label htmlFor="start-time" className="flex space-x-4 items-center">
            <div className="whitespace-nowrap">Starts at</div>
            <input
              type="datetime-local"
              disabled={false}
              className="border p-1 w-full"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
            />
          </label> */}
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
          <label
            htmlFor="price-in-goods"
            className="flex space-x-4 items-center"
          >
            <div className="whitespace-nowrap">Price (in $GOODS)</div>
            <input
              type="number"
              disabled={false}
              className="border p-1 w-full"
              value={pricePerTicketInGoods}
              onChange={(e) => setPricePerTicketInGoods(e.target.value)}
            />
          </label>
          <label htmlFor="price-in-sol" className="flex space-x-4 items-center">
            <div className="whitespace-nowrap">Price (in SOL)</div>
            <input
              type="number"
              disabled={false}
              className="border p-1 w-full"
              value={pricePerTicketInSol}
              onChange={(e) => setPricePerTicketInSol(e.target.value)}
            />
          </label>
          <label
            htmlFor="price-in-dust"
            className="flex space-x-4 items-center"
          >
            <div className="whitespace-nowrap">Price (in $DUST)</div>
            <input
              type="number"
              disabled={false}
              className="border p-1 w-full"
              value={pricePerTicketInDust}
              onChange={(e) => setPricePerTicketInDust(e.target.value)}
            />
          </label>
          <label
            htmlFor="price-in-forge"
            className="flex space-x-4 items-center"
          >
            <div className="whitespace-nowrap">Price (in $FORGE)</div>
            <input
              type="number"
              disabled={false}
              className="border p-1 w-full"
              value={pricePerTicketInForge}
              onChange={(e) => setPricePerTicketInForge(e.target.value)}
            />
          </label>
          <label
            htmlFor="price-in-gear"
            className="flex space-x-4 items-center"
          >
            <div className="whitespace-nowrap">Price (in $GEAR)</div>
            <input
              type="number"
              disabled={false}
              className="border p-1 w-full"
              value={pricePerTicketInGear}
              onChange={(e) => setPricePerTicketInGear(e.target.value)}
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
          <label
            htmlFor="total-winners"
            className="flex space-x-4 items-center"
          >
            <div className="whitespace-nowrap">Amount of winners</div>
            <input
              type="number"
              disabled={false}
              className="border p-1 w-full"
              value={totalWinnerCount}
              onChange={(e) => setTotalWinnerCount(e.target.value)}
            />
          </label>
          <label
            htmlFor="project-website-url"
            className="flex space-x-4 items-center"
          >
            <div className="whitespace-nowrap">Porject website url</div>
            <input
              type="text"
              disabled={false}
              className="border p-1 w-full"
              value={projectWebsiteUrl}
              onChange={(e) => setProjectWebsiteUrl(e.target.value)}
            />
          </label>
          <label
            htmlFor="project-twitter-url"
            className="flex space-x-4 items-center"
          >
            <div className="whitespace-nowrap">Porject twitter url</div>
            <input
              type="text"
              disabled={false}
              className="border p-1 w-full"
              value={projectTwitterUrl}
              onChange={(e) => setProjectTwitterUrl(e.target.value)}
            />
          </label>
          <label
            htmlFor="project-discord-url"
            className="flex space-x-4 items-center"
          >
            <div className="whitespace-nowrap">Porject discord url</div>
            <input
              type="text"
              disabled={false}
              className="border p-1 w-full"
              value={projectDiscordUrl}
              onChange={(e) => setProjectDiscordUrl(e.target.value)}
            />
          </label>
          <label
            htmlFor="project-discord-url"
            className="flex space-x-4 items-center"
          >
            <div className="whitespace-nowrap">Create as test raffle</div>
            <input
              type="checkbox"
              checked={isTestRaffle}
              onChange={() => setIsTestRaffle(!isTestRaffle)}
            />
          </label>
          <button
            onClick={handleAddRaffle}
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
