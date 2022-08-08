import { useLazyQuery } from "@apollo/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { ADD_USER } from "api/users/endpoint";
import axios from "axios";
import Spinner from "features/UI/Spinner";
import client from "graphql/apollo-client";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import Router, { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { DiscordUser } from "types/types";

type Response = {
  id: string;
};

const DiscordRedirect = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState<string | null>(null);
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchingDiscordUser, setFetchingDiscordUser] = useState(false);
  const { publicKey } = useWallet();
  const router = useRouter();

  const getAvatarUrl = () =>
    discordUser?.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null;

  const saveUser = useCallback(async () => {
    if (!discordUser) return;

    if (!publicKey) {
      console.error("No public key found");
      return;
    }

    try {
      const { data: existingUser } = await client.query({
        query: GET_USER_BY_WALLET,
        variables: { walletAddress: publicKey?.toString() },
      });

      if (existingUser?.id) {
        // update existing user
        return;
      }

      const { data } = await axios.post<Response>(ADD_USER, {
        discordName: discordUser.username,
        walletAddress: publicKey,
        avatarUrl: getAvatarUrl(),
      });
      console.log(data);
      router.push("/");
    } catch (error: any) {
      setError(error.message);
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discordUser, publicKey]);

  const fetchDiscordUser = useCallback(
    async ({
      accessToken,
      tokenType,
    }: {
      accessToken: string;
      tokenType: string;
    }) => {
      if (fetchingDiscordUser) return;
      setFetchingDiscordUser(true);
      console.log("fetchDiscordUser", `${tokenType} ${accessToken}`);
      try {
        const { data } = await axios.get(`https://discord.com/api/users/@me`, {
          headers: {
            authorization: `${tokenType} ${accessToken}`,
          },
        });

        setDiscordUser(data);
        setFetchingDiscordUser(false);
      } catch (error: any) {
        setError(error.message);
      }
    },
    [fetchingDiscordUser]
  );

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const [accessToken, tokenType] = [
      fragment.get("access_token"),
      fragment.get("token_type"),
    ];
    if (!accessToken || !tokenType) return;
    setAccessToken(accessToken);
    if (discordUser) {
      saveUser();
    } else if (!fetchingDiscordUser) {
      fetchDiscordUser({ accessToken, tokenType });
    }
  }, [discordUser, fetchDiscordUser, fetchingDiscordUser, saveUser]);

  if (!accessToken) {
    return <div>There was a problem</div>;
  }

  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="text-4xl mt-48 flex items-center space-x-4">
        {error ? (
          <div className="mr-4">There was an error saving: {error}</div>
        ) : (
          <>
            <div className="mr-4">Saving User Info</div>
            <Spinner />
          </>
        )}
      </div>
    </div>
  );
};

export default DiscordRedirect;
