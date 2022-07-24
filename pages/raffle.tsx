import ClientOnly from "features/client-only";
import Image from "next/image";
import RaffleList from "features/raffle-list";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import classNames from "classnames";
import Head from "next/head";

const ClientSide = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const wallet = useWallet();

  useEffect(() => {
    if (!wallet?.publicKey) return;
    setPublicKey(wallet.publicKey?.toString());
  }, [wallet, wallet.publicKey]);

  return (
    <>
      <Head>
        <title>Narentines - Raffle</title>
      </Head>
      <div className="h-full w-full">
        {/* top section */}
        <div className="flex flex-wrap w-full justify-center md:justify-between items-center">
          <div
            className={classNames({
              "w-full md:w-1/2": true,
              "-mb-2": !publicKey,
            })}
          >
            <Image
              height={880}
              width={625}
              src="/images/jester-img.png"
              alt="Frog Image"
              className="image-gradient"
            />
          </div>
          <div className="flex flex-col space-y-4 w-full md:w-1/2 max-w-sm -mt-40 lg:pt-32 pb-16 md:py-0">
            <Image
              src="/images/raffle-title.svg"
              width={417}
              height={120}
              alt="Raffle Title"
            />
            <div className="text-4xl w-full md:max-w-sm">
              Aye, Aye. Roll the dice ya amphibian coward!
            </div>
            <div>
              <WalletMultiButton />
            </div>
            {/* <div className="flex py-8 justify-between w-full">
            <button className="w-[47%] bg-amber-200 rounded-lg py-2 text-lg uppercase font-medium">
              Your Loot
            </button>
            <button className="w-[47%] text-amber-400 bg-green-800 rounded-lg py-2 text-lg uppercase font-medium">
              Select Booty
            </button>
          </div> */}
          </div>
          <div className="pr-0 md:pr-4"></div>
        </div>
        <ClientOnly>{publicKey && <RaffleList />}</ClientOnly>
        <style>
          {`
        @media only screen and (max-width: 767px) {
          .image-gradient {
            -webkit-mask-image:-webkit-gradient(linear, left top, left bottom, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)));
            // mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0));
          }
        }
          
      `}
        </style>
      </div>
    </>
  );
};

export default ClientSide;
