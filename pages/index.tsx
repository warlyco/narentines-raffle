import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Home: NextPage = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/raffle");
  }, []);

  return (
    <div className="">
      <div className="max-w-6xl m-auto p-4 py-6 text-2xl">NARENTINES</div>
    </div>
  );
};

export default Home;
