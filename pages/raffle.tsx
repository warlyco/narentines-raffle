import Image from "next/image";
import RaffleList from "features/raffle-list";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import classNames from "classnames";
import Head from "next/head";
import axios from "axios";
import { ADD_RAFFLE_ENTRY } from "api/raffles/endpoints";
import Overlay from "features/overlay";
import { Balances, ModalTypes, SplTokens } from "types/types";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getTokenMintAddress } from "features/solana/helpers";

type Token = Record<SplTokens, string>;

const RafflePage = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [userBalances, setUserBalances] = useState<Balances | null>(null);
  const [isSendingTransaction, setIsSendingTransaction] =
    useState<boolean>(false);

  const fetchUserBalances = useCallback(async () => {
    if (!publicKey) return;
    let balances = {};
    for (const token of Object.keys(SplTokens)) {
      if (token === SplTokens.SOL) {
        const balanceInLamports = await connection.getBalance(publicKey);
        const balance = balanceInLamports / LAMPORTS_PER_SOL;

        balances = { ...balances, [token]: balance };
      } else {
        const address = getTokenMintAddress(token as SplTokens);
        if (!address || !token) return;
        const { value: tokenAccounts } =
          await connection.getParsedTokenAccountsByOwner(publicKey, {
            mint: new PublicKey(address),
          });
        const balance =
          tokenAccounts?.[0]?.account?.data?.parsed?.info?.tokenAmount
            ?.uiAmount;
        console.log(balance);
        balances = { ...balances, [token]: balance };
      }
    }

    setUserBalances(balances);
  }, [connection, publicKey]);

  useEffect(() => {
    axios.post(ADD_RAFFLE_ENTRY, { noop: true });
    if (!publicKey) {
      setUserBalances(null);
      return;
    }
    fetchUserBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  return (
    <>
      <Head>
        <title>Narentines - Raffle</title>
      </Head>
      <div className="h-full w-full pb-14">
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

            <div className="text-sm italic">
              Have an issue or bug to report? <br /> Open a support ticket on
              our &nbsp;
              <a href="//discord.gg/9Dfh3PJG8S" className="underline">
                discord
              </a>
              &nbsp; and we will get it sorted!
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
        <RaffleList
          setIsSendingTransaction={setIsSendingTransaction}
          userBalances={userBalances}
        />
        <Overlay
          isVisible={isSendingTransaction}
          modalType={ModalTypes.SENDING_TRNASACTION}
        />
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

export default RafflePage;
