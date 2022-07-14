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
      <div
        style={{
          marginTop: `-${NAV_HEIGHT_IN_REMS}rem`,
          height: `calc(100vh - ${NAV_HEIGHT_IN_REMS}rem)`,
        }}
      >
        {children}
      </div>
    </>
  );
}
