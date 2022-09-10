import { useWallet } from "@solana/wallet-adapter-react";
import DiscordConnection from "features/oauth/discord-connection";
import TwitterConnection from "features/oauth/twitter-connection";
import Spinner from "features/UI/Spinner";
import client from "graphql/apollo-client";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import { useCallback, useEffect, useState } from "react";
import { User } from "types/types";
import bg from "public/images/single-item-bg.png";
import Image from "next/image";

const Preferences = () => {
  const [user, setUser] = useState<User | null>(null);
  const { publicKey } = useWallet();

  const fetchUser = useCallback(async () => {
    if (!publicKey) return;

    const { data } = await client.query({
      query: GET_USER_BY_WALLET,
      variables: { walletAddress: publicKey?.toString() },
      fetchPolicy: "network-only",
    });
    const user = data?.users?.[0];
    setUser(user);
  }, [publicKey]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="mt-28 mx-auto max-w-5xl">
      <div
        className="flex flex-col items-center max-w-md mx-auto shadow-xl rounded-lg p-4"
        style={{ backgroundImage: `url(${bg.src})` }}
      >
        <h1 className="text-4xl">Preferences</h1>
        {!!user ? (
          <div className="space-y-3">
            {!!user?.discordAvatarUrl && (
              <div className="py-4 flex w-full justify-center">
                <Image
                  src={user.discordAvatarUrl}
                  className="rounded-md"
                  height="128"
                  width="128"
                  alt="profile pic"
                />
              </div>
            )}
            <DiscordConnection user={user} />
            <TwitterConnection user={user} />
          </div>
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
};

export default Preferences;
