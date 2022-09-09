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
import queryString from "query-string";
import { ENVIRONMENT_URL } from "constants/constants";

type Response = {
  id: string;
};

const DiscordRedirect = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [twitterUser, setTwitterUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { publicKey } = useWallet();
  const router = useRouter();

  const getUserInfo = useCallback(async (code: string) => {
    const { data } = await axios.get(
      `${ENVIRONMENT_URL}/api/get-twitter-user-info`,
      {
        params: {
          code,
        },
      }
    );
    setTwitterUser(data);
  }, []);

  useEffect(() => {
    const { code } = queryString.parse(location.search);
    if (!code) return;
    // @ts-ignore
    getUserInfo(code);
    // @ts-ignore
    setAccessToken(code);
  }, []);

  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="text-4xl mt-48 flex items-center space-x-4">
        <div className="mr-4">Saving User Info</div>
        <div className="mr-4">{JSON.stringify(twitterUser)}</div>
        <Spinner />
      </div>
    </div>
  );
};

export default DiscordRedirect;
