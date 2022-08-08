import { useLazyQuery } from "@apollo/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { ADD_USER } from "api/users/endpoint";
import axios from "axios";
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
  const saveUser = useCallback(async () => {
    if (!discordUser) return;

    if (!publicKey) {
      console.error("No public key found");
      return;
    }

    try {
      const { data: existingUserData } = await client.query({
        query: GET_USER_BY_WALLET,
        variables: { walletAddress: publicKey?.toString() },
      });

      if (existingUserData?.users?.[0]?.id) {
        router.push("/");

        return;
      }

      const { data } = await axios.post<Response>(ADD_USER, {
        discordName: discordUser.username,
        walletAddress: publicKey,
        avatarUrl: discordUser?.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : null,
      });
    } catch (error: any) {
      setError(error.message);
      console.error(error);
    } finally {
      router.push("/");
    }
  }, [discordUser, publicKey, router]);

  const fetchDiscordUser = useCallback(
    async ({
      accessToken,
      tokenType,
    }: {
      accessToken: string;
      tokenType: string;
    }) => {
      console.log("fetchDiscordUser", `${tokenType} ${accessToken}`);
      try {
        const { data } = await axios.get(`https://discord.com/api/users/@me`, {
          headers: {
            authorization: `${tokenType} ${accessToken}`,
          },
        });

        setDiscordUser(data);
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
    if (discordUser) {
      saveUser();
    } else {
      fetchDiscordUser({ accessToken, tokenType });
    }
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
