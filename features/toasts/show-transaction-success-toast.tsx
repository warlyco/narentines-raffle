import { SOLANA_CLUSTER } from "constants/constants";
import showToast from "features/toasts/show-toast";

const showTransactionSuccessToast = (signature: string) => {
  showToast({
    primaryMessage: "Transaction successful!",
    link: {
      url: `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_CLUSTER}`,
      title: "View on Explorer",
    },
  });
};

export default showTransactionSuccessToast;
