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

        <button onClick={toggleSidebar}>
          <div className="h-8 w-8 bg-black rounded-md lg:hidden"></div>
        </button>

        <div className="items-center hidden lg:flex">
          {/* NAV ITEMS */}
          <WalletMultiButton />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
