import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import classNames from "classnames";
import bg from "public/images/bg-black.png";
import ScrollLock from "react-scrolllock";

type Props = {
  isOpenSidebar: boolean;
  toggleSidebar: () => void;
};

export const Sidebar = ({ isOpenSidebar, toggleSidebar }: Props) => {
  const handleCloseSidebar = () => {
    if (isOpenSidebar) {
      toggleSidebar();
    }
  };

  return (
    <>
      <ScrollLock isActive={isOpenSidebar}>
        <div
          onClick={handleCloseSidebar}
          className={classNames({
            "absolute top-0 right-0 bottom-0 left-0 transition-opacity duration-300 ease-in-out opacity-40 bg-slate-800 overflow-hidden":
              isOpenSidebar,
            "opacity-0 pointer-events-none": !isOpenSidebar,
          })}
        ></div>
      </ScrollLock>
      <div
        className={classNames({
          "fixed top-0 right-0 bottom-0 w-[380px] h-screen transition-position duration-300 ease-in-out":
            true,
          "-mr-96": !isOpenSidebar,
        })}
      >
        <div className="p-2 h-full">
          <div
            className="h-full rounded-md shadow-2xl p-6 flex flex-col w-full overflow-auto"
            style={{ backgroundImage: `url(${bg.src})` }}
          >
            <button
              className="text-amber-400 self-end text-4xl mb-8"
              onClick={handleCloseSidebar}
            >
              x
            </button>
            <div className="mb-16">
              <WalletMultiButton />
            </div>
            <div className="flex flex-col space-y-8">
              <div>
                <a
                  className="bg-amber-200 text-2xl px-3 uppercase rounded-lg font-bold"
                  href="//www.narentines.com"
                >
                  Home
                </a>
              </div>
              <div>
                <a
                  className="bg-amber-200 text-2xl mb-8 px-3 uppercase rounded-lg font-bold"
                  href="//explore.narentines.com"
                >
                  Explore the Valley
                </a>
              </div>
              <div>
                <a
                  className="bg-amber-200 text-2xl mb-8 px-3 uppercase rounded-lg font-bold"
                  href="//stake.narentines.com"
                >
                  Staking
                </a>
              </div>
              <div>
                <a
                  className="bg-amber-200 text-2xl mb-8 px-3 uppercase rounded-lg font-bold"
                  href=""
                >
                  Raffle
                </a>
              </div>
              <div>
                <a
                  className="bg-red-700 text-amber-200 text-2xl mb-8 px-3 uppercase rounded-lg font-bold"
                  href=""
                >
                  Litepaper
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
