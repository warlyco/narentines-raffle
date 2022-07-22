import classNames from "classnames";

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
          "absolute top-0 right-0 bottom-0 left-0 transition-opacity duration-300 ease-in-out opacity-40 bg-slate-600":
            true,
          "opacity-0 pointer-events-none": !isOpenSidebar,
        })}
      ></div>
      <div
        className={classNames({
          "absolute top-0 right-0 bottom-0 w-[400px] h-screen transition-position duration-300 ease-in-out":
            true,
          "-mr-96": !isOpenSidebar,
        })}
      >
        <div className="p-4 h-full">
          <div className="border bg-slate-100 h-full rounded shadow-2xl">
            {String(isOpenSidebar)}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
