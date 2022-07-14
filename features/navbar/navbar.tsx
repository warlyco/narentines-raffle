import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export const Navbar = () => {
  return (
    <div className="w-full absolute">
      <div className={`flex justify-between items-center max-w-6xl m-auto p-4`}>
        <Link href="/">
          <h1 className="cursor-pointer text-3xl italic">NARENTINES</h1>
        </Link>
        <WalletMultiButton />
      </div>
    </div>
  );
};

export default Navbar;
