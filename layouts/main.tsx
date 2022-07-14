import { NAV_HEIGHT_IN_REMS } from "constants/constants";
import Navbar from "features/navbar/navbar";
import classNames from "classnames";
import Footer from "features/footer";
import { MainContent } from "layouts/main-content";

type Props = {
  children: any;
};

export default function MainLayout({ children }: Props) {
  return (
    <>
      <Navbar />
      {/* eslint-disable-next-line react/no-children-prop */}
      <MainContent children={children} />
      <Footer />
    </>
  );
}
