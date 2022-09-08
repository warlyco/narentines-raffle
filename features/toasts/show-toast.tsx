import toast from "react-hot-toast";
import { Link } from "types/types";

const showToast = ({
  primaryMessage,
  secondaryMessage,
  link,
}: {
  primaryMessage: string;
  secondaryMessage?: string;
  link?: Link;
}) => {
  toast.custom(
    <div className="flex flex-col bg-amber-200 rounded-xl text-xl deep-shadow p-3 border-slate-400 text-center">
      <div>{primaryMessage}</div>
      {secondaryMessage && <div>{secondaryMessage}</div>}
      {link && (
        <a href={link.url} target="_blank" rel="noopener noreferrer">
          {link.title}
        </a>
      )}
    </div>
  );
};

export default showToast;
