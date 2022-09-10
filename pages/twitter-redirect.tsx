import { useLazyQuery } from "@apollo/client";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import Spinner from "features/UI/Spinner";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import queryString from "query-string";
import { ENVIRONMENT_URL } from "constants/constants";
import GET_USER_TWITTER_OAUTH_BY_WALLET from "graphql/queries/get-user-twitter-oauth-by-wallet";
import showToast from "features/toasts/show-toast";

const DiscordRedirect = () => {
  const [oAuthCodeVerifier, setOAuthCodeVerifier] = useState<string | null>(
    null
  );
  const [twitterUser, setTwitterUser] = useState<any | null>(null);
  const { publicKey } = useWallet();
  const router = useRouter();
  const [getUserTwitterOauthInfo, { loading, data }] = useLazyQuery(
    GET_USER_TWITTER_OAUTH_BY_WALLET
  );

  const saveUserTwitterInfo = useCallback(
    async (code: string, state: string) => {
      if (!oAuthCodeVerifier || !publicKey) return;

      const { data } = await axios.get(
        `${ENVIRONMENT_URL}/api/update-user-twitter`,
        {
          params: {
            walletAddress: publicKey?.toString(),
            code,
            codeVerifier: oAuthCodeVerifier,
            state,
          },
        }
      );
      if (data) {
        setTwitterUser(data);
        showToast({
          primaryMessage: "Twitter info saved!",
        });
      } else {
        showToast({
          primaryMessage: "Unable to save Twitter info",
        });
      }
      router.push("/");
    },
    [oAuthCodeVerifier, publicKey, router]
  );

  const fetchTwitterOAuthInfo = useCallback(
    async (code: string, state: string) => {
      const { data } = await getUserTwitterOauthInfo({
        variables: {
          walletAddress: publicKey?.toString(),
        },
      });

      const { twitterOAuthCodeVerifier: codeVerifier, twitterOAuthState } =
        data?.users?.[0];

      if (twitterOAuthState !== state) {
        console.log({ state, twitterOAuthState });
        debugger;
        debugger;
        showToast({
          primaryMessage: "Unable to save Twitter info",
        });
        router.push("/");
        return;
      }

      setOAuthCodeVerifier(codeVerifier);
      saveUserTwitterInfo(code, state);
    },
    [publicKey, getUserTwitterOauthInfo, saveUserTwitterInfo, router]
  );

  useEffect(() => {
    const { code, state } = queryString.parse(location.search);
    if (!code || !code?.[0] || !state || !state?.[0] || !publicKey?.toString())
      return;

    const oAuthCode = typeof code === "string" ? code : code[0];
    const oAuthState = typeof state === "string" ? state : state[0];
    fetchTwitterOAuthInfo(oAuthCode, oAuthState);
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
