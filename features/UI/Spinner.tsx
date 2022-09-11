import Image from "next/image";

const Spinner = () => (
  <Image
    className="animate-spin"
    src="/images/loader.svg"
    height={20}
    width={20}
    alt="Loading"
  />
);

export default Spinner;
