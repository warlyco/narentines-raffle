import { useMutation } from "@apollo/client";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { ENVIRONMENT_URL } from "constants/constants";
import showToast from "features/toasts/show-toast";
import UPDATE_USER_TWITTER_OAUTH from "graphql/mutations/update-user-twitter-oauth";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { User } from "types/types";
import twitterAuthClient from "utils/auth/twitter-auth-client";

/* eslint-disable @next/next/no-img-element */
const TwitterConnection = ({ user }: { user: User }) => {
  const [twitterAuthUrl, setTwitterAuthUrl] = useState<string | null>(null);
  const { publicKey } = useWallet();
  const router = useRouter();

  const [updateTwitterOAuthInfo, { loading, data }] = useMutation(
    UPDATE_USER_TWITTER_OAUTH
  );

  const handleConnectWithTwitter = () => {
    if (!twitterAuthUrl) return;

    axios.post(`${ENVIRONMENT_URL}/api/update-user-twitter`, {
      noop: true,
    });
    setTimeout(() => {
      window.location.href = twitterAuthUrl;
    }, 500);
  };

  const handleUpdateTwitterOAuthInfo = useCallback(
    async (codeVerifier: string, state: string) => {
      const { data } = await updateTwitterOAuthInfo({
        variables: {
          codeVerifier,
          state,
          walletAddress: publicKey?.toString(),
        },
      });
      const { twitterOAuthCodeVerifier, twitterOAuthState } =
        data.update_users.returning[0];
      if (!twitterOAuthCodeVerifier || !twitterOAuthState) {
        showToast({
          primaryMessage: "Could not save Twitter info",
        });
        router.push("/");
        return;
      }
    },
    [publicKey, router, updateTwitterOAuthInfo]
  );

  useEffect(() => {
    const { url, codeVerifier, state } =
      twitterAuthClient.generateOAuth2AuthLink(
        `${ENVIRONMENT_URL}/twitter-redirect`,
        {
          scope: ["tweet.read", "users.read", "offline.access"],
        }
      );
    setTwitterAuthUrl(url);
    handleUpdateTwitterOAuthInfo(codeVerifier, state);
  }, [handleUpdateTwitterOAuthInfo]);

  return (
    <>
      {!!user.twitterId ? (
        <div className="font-bold text-xl mb-2 bg-blue-500 rounded-lg px-4 py-3 flex items-center space-x-3 text-amber-200 max-w-64">
          <Image
            height={18}
            width={22}
            src="/images/twitter.svg"
            alt="Twitter"
            className="block"
          />
          <div className="truncate">{user.twitterUsername}</div>
        </div>
      ) : (
        <button
          className="text-xl bg-blue-500 text-amber-200 rounded-md px-4 py-2 inline-flex items-center justify-center uppercase space-x-3 w-full"
          onClick={handleConnectWithTwitter}
        >
          <div className="mt-2">
            <Image
              height={18}
              width={22}
              src="/images/twitter.svg"
              alt="Twitter"
              className="block"
            />
          </div>
          <div className="mr-2 mt-1">Connect with Twitter</div>
        </button>
      )}
    </>
  );
};

export default TwitterConnection;
