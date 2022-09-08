import { SOLANA_CLUSTER } from "constants/constants";
import { AppError } from "types/types";
import showToast from "./show-toast";

const showCouldNotConfirmTransactionToast = ({
  signature,
  error,
}: {
  signature: string;
  error: AppError;
}): void => {
  showToast({
    primaryMessage: "Your purchase could not be confirmed.",
    secondaryMessage: "Please open a support ticket in discord for assistance",
    error,
    link: {
      url: `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_CLUSTER}`,
      title: "View on Explorer",
    },
  });
};

export default showCouldNotConfirmTransactionToast;
