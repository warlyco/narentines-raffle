import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  return (
    <div className="w-full fixed top-0">
      <div className="flex justify-between items-center max-w-6xl m-auto p-4">
        <Link href="/">
          <Image
            src="/images/logo.svg"
            width="236"
            height="43"
            alt="logo"
            className="cursor-pointer"
          />
        </Link>
        <WalletMultiButton />
      </div>
    </div>
  );
};

export default Navbar;
