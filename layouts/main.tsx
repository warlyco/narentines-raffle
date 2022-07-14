import { NAV_HEIGHT_IN_REMS } from "constants/constants";
import Navbar from "features/navbar/navbar";
import classNames from "classnames";

type Props = {
  children: any;
};

export default function MainLayout({ children }: Props) {
  return (
    <>
      <Navbar />
      <div>
        {children}
        <footer className="flex w-full">
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by
          </a>
        </footer>
      </div>
    </>
  );
}
