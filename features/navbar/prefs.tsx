import Image from "next/image";

const Prefs = () => {
  return (
    <div className="absolute bg-white rounded-lg shadow-xl p-4">
      <h2 className="text-xl text-center">Preferences</h2>
      <div className="flex justify-center">
        <button className="bg-amber-200 hover:bg-opacity-0 hover:border-2 hover:border-amber-200 rounded-lg text-black shadow-xl">
          <Image
            height={18}
            width={20}
            src="/images/user.svg"
            alt="Medium"
            className="cursor-pointer"
          />
        </button>
      </div>
    </div>
  );
};

export default Prefs;
