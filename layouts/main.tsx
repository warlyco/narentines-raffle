import { Toaster } from "react-hot-toast";
import { NAV_HEIGHT_IN_REMS } from "constants/constants";
import Navbar from "features/navbar/navbar";
import classNames from "classnames";
import Footer from "features/footer";
import { MainContent } from "layouts/main-content";
import bg from "public/images/bg-pattern.png";

type Props = {
  children: any;
};

export default function MainLayout({ children }: Props) {
  return (
    <div
      className="h-full w-full relative min-h-screen"
      style={{ backgroundImage: `url(${bg.src})` }}
    >
      {/* eslint-disable-next-line react/no-children-prop */}
      <Toaster />
      {/* eslint-disable-next-line */}
      <MainContent children={children} />
      <Navbar />
      <Footer />
    </div>
  );
}
