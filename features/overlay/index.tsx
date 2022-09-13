import classNames from "classnames";
import Spinner from "features/UI/Spinner";
import ScrollLock from "react-scrolllock";
import { ModalTypes } from "types/types";

type Props = {
  onClick?: () => void;
  isVisible: boolean;
  modalType?: ModalTypes;
};

const showMessage = (lineOne: string, lineTwo: string) => (
  <div className="text-center">
    <div className="font-bold text-2xl">{lineOne}</div>
    <div className="py-4 italic">{lineTwo}</div>
    <div>
      <Spinner />
    </div>
  </div>
);

const Overlay = ({ onClick, isVisible, modalType }: Props) => {
  const getMessage = () => {
    switch (modalType) {
      case ModalTypes.CLAIMING_GOODS:
        return showMessage("Claiming Goods", "Please do not close this window");
      case ModalTypes.SENDING_TRANSACTION:
      default:
        return showMessage(
          "Submitting Transaction",
          "Please do not close this window"
        );
    }
  };

  return (
    <>
      <ScrollLock isActive={isVisible}>
        <div
          onClick={onClick}
          className={classNames({
            "fixed top-0 right-0 bottom-0 left-0 transition-all duration-500 ease-in-out bg-opaque bg-black py-6":
              isVisible,
            "opacity-0 pointer-events-none": !isVisible,
          })}
        >
          {!!modalType && (
            <div className="bg-amber-200 m-auto fixed top-1/2 left-1/2 centered p-4 rounded">
              {getMessage()}
            </div>
          )}
        </div>
      </ScrollLock>
      <style>
        {`
          .bg-opaque {
            background-color: rgba(0,0,0,0.6);
          }
          .centered {
            transform: translate(-50%, -50%);

          }
        `}
      </style>
    </>
  );
};

export default Overlay;
