import Image from "next/image";
import Prefs from "features/navbar/prefs";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { useWallet } from "@solana/wallet-adapter-react";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import client from "graphql/apollo-client";
const SwalReact = withReactContent(Swal);

const UserButton = () => {
  const { publicKey } = useWallet();

  const showPefsDialog = async () => {
    if (!publicKey) return;

    const { data } = await client.query({
      query: GET_USER_BY_WALLET,
      variables: { walletAddress: publicKey?.toString() },
      fetchPolicy: "network-only",
    });

    SwalReact.fire({
      showCloseButton: true,
      showConfirmButton: false,
      html: <Prefs user={data?.users?.[0]} />,
    });
  };

  return (
    <button
      className="flex justify-center items-center h-8 w-8 bg-amber-200 hover:bg-opacity-0 hover:border-2 hover:border-amber-200 rounded-lg text-black shadow-xl"
      onClick={showPefsDialog}
    >
      <Image
        height={18}
        width={20}
        src="/images/user.svg"
        alt="Medium"
        className="cursor-pointer"
      />
    </button>
  );
};

export default UserButton;
