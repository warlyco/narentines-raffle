import classNames from "classnames";
import ScrollLock from "react-scrolllock";

type Props = {
  onClick: () => void;
  isVisible: boolean;
};

const Overlay = ({ onClick, isVisible }: Props) => {
  return (
    <ScrollLock isActive={isVisible}>
      <div
        onClick={onClick}
        className={classNames({
          "absolute top-0 right-0 bottom-0 left-0 transition-opacity duration-500 ease-in-out opacity-40 bg-slate-800 py-6":
            isVisible,
          "opacity-0 pointer-events-none": !isVisible,
        })}
      ></div>
    </ScrollLock>
  );
};

export default Overlay;
