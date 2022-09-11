import Image from "next/image";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { useWallet } from "@solana/wallet-adapter-react";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import client from "graphql/apollo-client";
const SwalReact = withReactContent(Swal);
import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const UserButton = () => {
  const { publicKey } = useWallet();

  const walletAddress = publicKey?.toString();
  if (!walletAddress) return <></>;

  return (
    <button className="py-2 px-2 bg-green-800 hover:bg-green-900 rounded">
      <Link href="/me">
        <Cog8ToothIcon className="h-8 w-8 text-amber-400" />
      </Link>
    </button>
    // <button
    //   className="flex justify-center items-center bg-amber-200 hover:bg-opacity-0 hover:border-2 hover:border-amber-200 rounded-lg text-black shadow-xl border-2 border-green-800"
    //   onClick={showPreferencesModal}
    // >
    //   <div className="h-10 w-10 border-r-2 border-r-green-800 flex items-center justify-center">
    //     <Image
    //       height={18}
    //       width={20}
    //       src="/images/user.svg"
    //       alt="Medium"
    //       className="cursor-pointer"
    //     />
    //   </div>
    //   <div className="h-10 flex items-center px-4 text-lg">
    //     {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
    //   </div>
    // </button>
  );
};

export default UserButton;
