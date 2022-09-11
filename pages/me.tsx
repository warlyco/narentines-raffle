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
import axios from "axios";
import { E008 } from "errors/types";
import showGenericErrorToast from "features/toasts/show-generic-error-toast";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/router";

const Me = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userFetched, setUserFetched] = useState(false);
  const { publicKey } = useWallet();
  const router = useRouter();

  const createUser = useCallback(async () => {
    if (user) return;
    try {
      const { data } = await axios.post("/api/add-user", {
        walletAddress: publicKey?.toString(),
      });

      if (!data?.newUser?.id) {
        showGenericErrorToast(E008);
        router.push("/");
        return;
      }

      setUser(data.newUser);
      console.log(user);
      debugger;
    } catch (e) {
      showGenericErrorToast(E008);
      router.push("/");
    }
  }, [publicKey, user, router]);

  const fetchUser = useCallback(async () => {
    if (!publicKey) return;

    const { data } = await client.query({
      query: GET_USER_BY_WALLET,
      variables: { walletAddress: publicKey?.toString() },
      fetchPolicy: "network-only",
    });
    setUserFetched(true);
    const user = data?.users?.[0];
    console.log(data);
    debugger;
    if (user?.id) {
      setUser(user);
    }
  }, [publicKey]);

  useEffect(() => {
    if (!publicKey) return;
    if (!user && !userFetched) {
      fetchUser();
      return;
    }
    if (!user && userFetched) {
      createUser();
    }
  }, [createUser, fetchUser, publicKey, user, userFetched]);

  return (
    <div className="mt-28 mx-auto max-w-5xl">
      <div
        className="flex flex-col items-center justify-center max-w-md mx-auto shadow-xl rounded-lg p-4"
        style={{ backgroundImage: `url(${bg.src})` }}
      >
        <h1 className="text-4xl mb-4">Preferences</h1>
        {!publicKey && (
          <div className="mb-2">
            <WalletMultiButton />
          </div>
        )}
        {!!user ? (
          <div className="space-y-2">
            {!!user?.discordAvatarUrl && (
              <div className="pb-4 flex w-full justify-center">
                <Image
                  src={user.discordAvatarUrl}
                  className="rounded-md"
                  height="128"
                  width="128"
                  alt="profile pic"
                />
              </div>
            )}
            <div className="space-y-3 pb-2">
              <DiscordConnection user={user} />
              <TwitterConnection user={user} />
            </div>
          </div>
        ) : (
          !!publicKey && <Spinner />
        )}
      </div>
    </div>
  );
};

export default Me;
