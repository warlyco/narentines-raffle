import { useQuery } from "@apollo/client";
import { User } from "@sentry/types";
import { useWallet } from "@solana/wallet-adapter-react";
import Spinner from "features/UI/Spinner";
import client from "graphql/apollo-client";
import { GET_USER_BY_WALLET } from "graphql/queries/get-user-by-wallet";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const Prefs = ({ publicKey }: { publicKey: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userWasFetched, setUserWasFetched] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await client.query({
        query: GET_USER_BY_WALLET,
        variables: { walletAddress: publicKey?.toString() },
      });

      if (data?.users?.length) {
        setUser(data.users[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setUserWasFetched(true);
    }
  }, [publicKey]);

  useEffect(() => {
    if (user || isLoading || userWasFetched || !publicKey?.toString()) return;
    fetchUser();
  }, [fetchUser, isLoading, publicKey, user, userWasFetched]);

  if (!publicKey?.toString() || isLoading) return <Spinner />;

  return (
    <div>
      {!!user ? (
        <div>
          <div className="py-2">
            <Image
              src={user.avatarUrl}
              className="rounded-md"
              height={128}
              width={128}
              alt="profile pic"
            />
          </div>
          <div className="font-bold text-3xl text-black mb-2">
            {user.discordName}
          </div>
          <div className="text-black text-sm">{user.walletAddress}</div>
        </div>
      ) : (
        <a href="https://discord.com/api/oauth2/authorize?client_id=1005970963986399272&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdiscord-redirect&response_type=token&scope=identify">
          Login with Discord
        </a>
      )}
    </div>
  );
};

export default Prefs;
