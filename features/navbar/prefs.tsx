/* eslint-disable @next/next/no-img-element */
import { useQuery } from "@apollo/client";
import { User } from "@sentry/types";
import { useWallet } from "@solana/wallet-adapter-react";
import Spinner from "features/UI/Spinner";
import client from "graphql/apollo-client";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import Image from "next/image";

type Props = {
  user: User | null;
};

const Prefs = ({ user }: Props) => {
  return (
    <div>
      {!!user ? (
        <div>
          <div className="py-4 flex w-full justify-center">
            <img
              src={user.avatarUrl}
              className="rounded-md"
              height="128"
              width="128"
              alt="profile pic"
            />
          </div>
          <div className="font-bold text-3xl text-black mb-2">
            {user.discordName}
          </div>
          <div className="text-black text-sm">{user.walletAddress}</div>
        </div>
      ) : (
        <div className="pb-4 pt-8">
          <a
            className="text-2xl bg-purple-700 text-amber-200 rounded-md px-4 py-2 inline-flex items-center justify-center uppercase"
            href="https://discord.com/api/oauth2/authorize?client_id=1005970963986399272&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdiscord-redirect&response_type=token&scope=identify"
          >
            <div className="mr-2">Connect with</div>
            <div className="mt-1">
              <Image
                height={20}
                width={26}
                src="/images/discord.svg"
                alt="Discord"
                className="block"
              />
            </div>
          </a>
        </div>
      )}
    </div>
  );
};

export default Prefs;
