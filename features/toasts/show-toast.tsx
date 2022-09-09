import toast from "react-hot-toast";
import { AppError, ToastLink } from "types/types";

const showToast = ({
  primaryMessage,
  secondaryMessage,
  link,
  error,
}: {
  primaryMessage: string;
  secondaryMessage?: string;
  link?: ToastLink;
  error?: AppError;
}) => {
  toast.custom(
    <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
      <div>{primaryMessage}</div>
      {secondaryMessage && <div>{secondaryMessage}</div>}
      {link && (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {link.title}
        </a>
      )}
      {error && (
        <div className="text-sm font-bold text-red-600">
          Error Code {error.code}
        </div>
      )}
    </div>
  );
};

export default showToast;
