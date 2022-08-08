import Image from "next/image";
import swal from "@sweetalert/with-react";
import Prefs from "features/navbar/prefs";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { useWallet } from "@solana/wallet-adapter-react";
const SwalReact = withReactContent(Swal);

const UserButton = () => {
  const { publicKey } = useWallet();

  const showPefsDialog = () => {
    if (!publicKey) return;
    SwalReact.fire({
      html: <Prefs publicKey={publicKey.toString()} />,
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
