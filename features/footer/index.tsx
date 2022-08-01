import Image from "next/image";
import bg from "public/images/bg-black.png";

export const Footer = () => (
  <footer
    className="w-full bottom-0 text-amber-400 lg:h-28"
    style={{ backgroundImage: `url(${bg.src})` }}
  >
    <div className="flex flex-wrap justify-between max-w-5xl px-4 mx-auto py-5 h-full space-y-8 md:space-y-0">
      <div className="flex flex-col justify-center items-center h-full w-full lg:w-auto">
        <Image
          height={30}
          width={180}
          src="/images/swamp-labs.svg"
          alt="Swamp Labs"
        />
        <div className="text-xs">© Swamp Labs d.o.o. / MMXXII</div>
      </div>
      <div className="flex flex-col justify-center items-center h-full -mt-1 w-full lg:w-auto">
        <div className="mb-2">Join us on social media</div>
        <div className="flex justify-between space-x-4">
          <a href="//twitter.com/narentines" target="_blank" rel="noreferrer">
            <Image
              height={14}
              width={16}
              src="/images/twitter.svg"
              alt="Twitter"
              className="cursor-pointer"
            />
          </a>
          <a href="//discord.gg/9Dfh3PJG8S" target="_blank" rel="noreferrer">
            <Image
              height={13}
              width={18}
              src="/images/discord.svg"
              alt="Discord"
              className="cursor-pointer"
            />
          </a>
          <a href="//narentines.medium.com/" target="_blank" rel="noreferrer">
            <Image
              height={13}
              width={18}
              src="/images/medium.svg"
              alt="Medium"
              className="cursor-pointer"
            />
          </a>
        </div>
      </div>
      <div className="flex flex-col lgitems-end w-full lg:w-auto">
        <Image
          height={60}
          width={220}
          src="/images/carbon-neutral.png"
          alt="carbon neutral"
        />
      </div>
    </div>
  </footer>
);

export default Footer;
