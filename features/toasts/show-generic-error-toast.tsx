import showToast from "features/toasts/show-toast";
import { AppError } from "types/types";

const showGenericErrorToast = (error: AppError): void => {
  showToast({
    primaryMessage: "There was an issue, please try again.",
    error,
  });
};

export default showGenericErrorToast;
