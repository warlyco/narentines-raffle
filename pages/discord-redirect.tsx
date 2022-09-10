import { useLazyQuery } from "@apollo/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { ADD_USER } from "api/users/endpoint";
import axios from "axios";
import { ENVIRONMENT_URL } from "constants/constants";
import showToast from "features/toasts/show-toast";
import Spinner from "features/UI/Spinner";
import client from "graphql/apollo-client";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import Router, { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { DiscordUser, User } from "types/types";

type Response = {
  id: string;
};

const DiscordRedirect = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { publicKey } = useWallet();
  const router = useRouter();
  const saveUser = useCallback(
    async (user: any) => {
      if (!discordUser) return;

      if (!publicKey) {
        console.error("No public key found");
        return;
      }

      try {
        // const { data: existingUserData } = await client.query({
        //   query: GET_USER_BY_WALLET,
        //   variables: { walletAddress: publicKey?.toString() },
        // });

        const { data } = await axios.post(
          `${ENVIRONMENT_URL}/api/update-user-discord`,
          {
            walletAddress: publicKey,
            discordId: user.id,
            discordName: user.username,
            discordAvatarUrl: user?.avatar
              ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
              : null,
          }
        );

        if (data) {
          showToast({
            primaryMessage: "Discord info saved!",
          });
          router.push("/preferences");
        } else {
          showToast({
            primaryMessage: "Unable to save Discord info",
          });
          router.push("/");
        }
      } catch (error: any) {
        setError(error.message);
        console.error(error);
      } finally {
        router.push("/");
      }
    },
    [discordUser, publicKey, router]
  );

  const fetchDiscordUser = useCallback(
    async ({
      accessToken,
      tokenType,
    }: {
      accessToken: string;
      tokenType: string;
    }) => {
      try {
        const { data: user } = await axios.get(
          `https://discord.com/api/users/@me`,
          {
            headers: {
              authorization: `${tokenType} ${accessToken}`,
            },
          }
        );

        saveUser(user);
      } catch (error: any) {
        setError(error.message);
      }
    },
    []
  );

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const [accessToken, tokenType] = [
      fragment.get("access_token"),
      fragment.get("token_type"),
    ];
    if (!accessToken || !tokenType) {
      router.push("/");
      return;
    }
    setAccessToken(accessToken);
    fetchDiscordUser({ accessToken, tokenType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discordUser]);

  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="text-4xl mt-48 flex items-center space-x-4">
        <div className="mr-4">Saving User Info</div>
        <Spinner />
      </div>
    </div>
  );
};

export default DiscordRedirect;
