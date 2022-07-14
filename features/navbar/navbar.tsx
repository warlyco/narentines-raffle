import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export const Navbar = () => {
  return (
    <div className="w-full absolute top-0">
      <div className={`flex justify-between items-center max-w-6xl m-auto p-4`}>
        <Link href="/">
          <h1 className="cursor-pointer text-3xl italic bg-black text-amber-400 p-2 rounded">
            NARENTINES
          </h1>
        </Link>
        <WalletMultiButton />
      </div>
    </div>
  );
};

export default Navbar;
