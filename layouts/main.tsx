import { Toaster } from "react-hot-toast";
import Navbar from "features/navbar/navbar";
import { MainContent } from "layouts/main-content";
import bg from "public/images/bg-pattern.png";
import Sidebar from "features/sidebar";
import { useState } from "react";

type Props = {
  children: any;
};

export default function MainLayout({ children }: Props) {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  const toggleSidebar = () => {
    setIsOpenSidebar(!isOpenSidebar);
  };

  return (
    <div
      className="h-full w-full relative min-h-screen overflow-hidden"
      style={{ backgroundImage: `url(${bg.src})` }}
    >
      <Toaster />
      <MainContent>{children}</MainContent>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpenSidebar={isOpenSidebar} toggleSidebar={toggleSidebar} />
    </div>
  );
}
