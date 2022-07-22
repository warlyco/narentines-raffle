import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";

type Props = {
  toggleSidebar: () => void;
};

export const Navbar = ({ toggleSidebar }: Props) => {
  return (
    <div className="w-full fixed top-0">
      <div className="flex justify-between items-center max-w-5xl m-auto p-4">
        <Link href="/">
          <a className="flex items-center">
            <Image
              src="/images/logo.svg"
              width="236"
              height="43"
              alt="logo"
              className="cursor-pointer"
            />
          </a>
        </Link>

        <div className="hidden lg:flex items-center space-x-2">
          <a
            className="bg-amber-200 hover:bg-black hover:text-amber-200 text-lg px-3 py-1 uppercase rounded-lg font-bold"
            href="//www.narentines.com"
          >
            Home
          </a>
          <a
            className="bg-amber-200 hover:bg-black hover:text-amber-200 text-lg px-3 py-1 uppercase rounded-lg font-bold"
            href="//explore.narentines.com"
          >
            Explore the Valley
          </a>
          <a
            className="bg-amber-200 hover:bg-black hover:text-amber-200 text-lg px-3 py-1 uppercase rounded-lg font-bold"
            href="//stake.narentines.com"
          >
            Staking
          </a>
          <a
            className="bg-amber-200 text-lg px-3 py-1 uppercase rounded-lg font-bold opacity-70"
            href="//stake.narentines.com"
            aria-disabled="true"
          >
            Raffle
          </a>
          <a
            className="flex justify-center items-center h-8 w-8 bg-amber-200 hover:bg-opacity-0 hover:border-2 hover:border-amber-200 rounded-lg text-black"
            href="//twitter.com/narentines"
          >
            <Image
              height={14}
              width={16}
              src="/images/twitter-black.svg"
              alt="Twitter"
              className="cursor-pointer"
            />
          </a>
          <a
            className="flex justify-center items-center h-8 w-8 bg-amber-200 hover:bg-opacity-0 hover:border-2 hover:border-amber-200 rounded-lg text-black"
            href="//discord.gg/9Dfh3PJG8S"
          >
            <Image
              height={18}
              width={20}
              src="/images/discord-black.svg"
              alt="Discord"
              className="cursor-pointer"
            />
          </a>
          <a
            className="flex justify-center items-center h-8 w-8 bg-amber-200 hover:bg-opacity-0 hover:border-2 hover:border-amber-200 rounded-lg text-black"
            href="//narentines.medium.com/"
          >
            <Image
              height={18}
              width={20}
              src="/images/medium-black.svg"
              alt="Medium"
              className="cursor-pointer"
            />
          </a>
        </div>
        <div className="flex space-x-4">
          <button onClick={toggleSidebar}>
            <div className="h-8 w-8 bg-black rounded-md lg:hidden"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
