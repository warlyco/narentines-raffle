import axios from "axios";
import classNames from "classnames";
import { useState } from "react";

const AdminPanel = () => {
  const [walletAddressInputValue, setWalletAddressInputValue] =
    useState<string>("");
  const [nftMintAddress, setNftMintAddress] = useState<string>("");
  const [isMinting, setIsMinting] = useState<boolean>(false);

  const handleMintNft = async (e: any) => {
    e.preventDefault();

    try {
      setIsMinting(true);
      // const { data: nft } = await axios.post("/api/create-nft", {
      //   owner: walletAddressInputValue,
      // });

      // console.log("MINTED!", nft);
    } catch (error) {
      console.error(error);
    } finally {
      setIsMinting(false);
    }
  };

  const handleAddRaffle = () => {};

  return (
    <div className="w-full max-w-lg mx-auto">
      <h1 className="text-2xl mb-2">ADMIN</h1>
      <form className="space-y-4">
        <div>
          <h1>Mint Fake Frog</h1>
          <label htmlFor="wallet" className="flex space-x-4 items-center">
            <div className="whitespace-nowrap">Wallet Address</div>
            <input
              disabled={false}
              className="border p-1 w-full"
              value={walletAddressInputValue}
              onChange={(e) => setWalletAddressInputValue(e.target.value)}
            />
          </label>
          <button
            onClick={(e) => handleMintNft(e)}
            className={classNames({
              "p-4 py-2 rounded border shadow": true,
              "bg-slate-400 animate-pulse": isMinting,
              "cursor-pointer": !isMinting,
            })}
            type="submit"
            disabled={isMinting}
          >
            {isMinting ? "Minting..." : "Mint"}
          </button>
        </div>
        <div>
          <h1>Add raffle</h1>
          <label htmlFor="wallet" className="flex space-x-4 items-center">
            <div className="whitespace-nowrap">NFT Mint Address</div>
            <input
              disabled={false}
              className="border p-1 w-full"
              value={nftMintAddress}
              onChange={(e) => setNftMintAddress(e.target.value)}
            />
          </label>
          <button
            onClick={(e) => handleAddRaffle(e)}
            className={classNames({
              "p-4 py-2 rounded border shadow": true,
              "bg-slate-400 animate-pulse": isMinting,
              "cursor-pointer": !isMinting,
            })}
            type="submit"
            disabled={isMinting}
          >
            {isMinting ? "Minting..." : "Mint"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPanel;
