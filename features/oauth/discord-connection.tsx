import axios from "axios";
import { ENVIRONMENT_URL } from "constants/constants";
import Image from "next/image";
import { User } from "types/types";

/* eslint-disable @next/next/no-img-element */
const DiscordConnection = ({ user }: { user: User }) => {
  let href: string;

  switch (process.env.NEXT_PUBLIC_ENV) {
    case "production":
      href =
        "https://discord.com/api/oauth2/authorize?client_id=1005970963986399272&redirect_uri=https%3A%2F%2Fbazaar.narentines.com%2Fdiscord-redirect&response_type=token&scope=identify";
      break;
    case "preview":
      href =
        "https://discord.com/api/oauth2/authorize?client_id=1005970963986399272&redirect_uri=https%3A%2F%2Ftest-bazaar.narentines.com%2Fdiscord-redirect&response_type=token&scope=identify";
      break;
    case "local":
    default:
      href =
        "https://discord.com/api/oauth2/authorize?client_id=1005970963986399272&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdiscord-redirect&response_type=token&scope=identify";
      break;
  }

  const handleConnectWithDiscord = () => {
    axios.post(`${ENVIRONMENT_URL}/api/update-user-discord`, {
      noop: true,
    });
    setTimeout(() => {
      window.location.href = href;
    }, 500);
  };

  return (
    <>
      {!!user.discordId ? (
        <div>
          <div className="font-bold text-xl mb-2 bg-purple-700 rounded-lg px-4 py-3 flex items-center space-x-3 text-amber-200 max-w-64">
            <Image
              height={20}
              width={26}
              src="/images/discord.svg"
              alt="Discord"
              className="block"
            />
            <div className="truncate">{user.discordName}</div>
          </div>
        </div>
      ) : (
        <button
          className="text-xl bg-purple-700 text-amber-200 rounded-md px-4 py-2 inline-flex items-center justify-center uppercase space-x-3"
          onClick={handleConnectWithDiscord}
        >
          <div className="mt-2">
            <Image
              height={20}
              width={26}
              src="/images/discord.svg"
              alt="Discord"
              className="block"
            />
          </div>
          <div className="mr-2">Connect with Discord</div>
        </button>
      )}
    </>
  );
};

export default DiscordConnection;
