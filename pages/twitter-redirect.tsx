import { useLazyQuery, useQuery } from "@apollo/client";
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
import GET_USER_TWITTER_OAUTH_BY_WALLET from "graphql/queries/get-user-twitter-oauth-by-wallet";

const DiscordRedirect = () => {
  const [oAuthCodeVerifier, setOAuthCodeVerifier] = useState<string | null>(
    null
  );
  const [oAuthState, setOAuthState] = useState<string | null>(null);
  const [oAuthCode, setOAuthCode] = useState<string | null>(null);
  const [twitterUser, setTwitterUser] = useState<any | null>(null);
  const { publicKey } = useWallet();
  const router = useRouter();
  const [getUserTwitterOauthInfo, { loading, data }] = useLazyQuery(
    GET_USER_TWITTER_OAUTH_BY_WALLET
  );

  const getUserInfo = useCallback(async () => {
    const { data } = await axios.get(
      `${ENVIRONMENT_URL}/api/get-twitter-user-info`,
      {
        params: {
          code: oAuthCode,
          codeVerifier: oAuthCodeVerifier,
        },
      }
    );
    setTwitterUser(data);
  }, [oAuthCode, oAuthCodeVerifier]);

  const fetchTwitterOAuthInfo = useCallback(async () => {
    console.log(publicKey?.toString());
    const { data } = await getUserTwitterOauthInfo({
      variables: {
        walletAddress: publicKey?.toString(),
      },
    });

    const { twitterOAuthCodeVerifier: codeVerifier, twitterOAuthState: state } =
      data?.users?.[0];
    setOAuthCodeVerifier(codeVerifier);
    setOAuthState(state);
    console.log(data);
    getUserInfo();
  }, [getUserInfo, getUserTwitterOauthInfo, publicKey]);

  useEffect(() => {
    const { code } = queryString.parse(location.search);
    if (!code || !publicKey?.toString()) return;
    setOAuthCode(typeof code === "string" ? code : code?.[0]);
    fetchTwitterOAuthInfo();
  }, [fetchTwitterOAuthInfo, publicKey]);

  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="text-4xl mt-48 flex items-center space-x-4">
        {loading && (
          <>
            <div className="mr-4">Saving User Info</div>
            <Spinner />
          </>
        )}
        <div className="mr-4">{JSON.stringify(twitterUser)}</div>
      </div>
    </div>
  );
};

export default DiscordRedirect;
