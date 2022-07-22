import classNames from "classnames";
import bg from "public/images/bg-black.png";

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
      <div
        onClick={handleCloseSidebar}
        className={classNames({
          "absolute top-0 right-0 bottom-0 left-0 transition-opacity duration-300 ease-in-out opacity-40 bg-slate-800":
            isOpenSidebar,
          "opacity-0 pointer-events-none": !isOpenSidebar,
        })}
      ></div>
      <div
        className={classNames({
          "absolute top-0 right-0 bottom-0 w-[380px] h-screen transition-position duration-300 ease-in-out":
            true,
          "-mr-96": !isOpenSidebar,
        })}
      >
        <div className="p-2 h-full">
          <div
            className="h-full rounded-md shadow-2xl"
            style={{ backgroundImage: `url(${bg.src})` }}
          >
            {String(isOpenSidebar)}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
