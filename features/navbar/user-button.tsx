import Image from "next/image";
// import swal from "@sweetalert/with-react";
import Prefs from "./prefs";

const UserButton = () => {
  const showPefsDialog = () => {
    // swal(Prefs);
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
