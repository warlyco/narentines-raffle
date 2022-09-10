import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { ENVIRONMENT_URL } from "constants/constants";
import twitterAuthClient from "utils/auth/twitter-auth-client";
import request from "graphql-request";
import UPDATE_USER_TWITTER_OAUTH from "graphql/mutations/update-user-twitter-oauth";
import UPDATE_USER_TWITTER from "graphql/mutations/update-user-twitter";

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  const { code, codeVerifier, walletAddress, state } = req.query;

  if (!code || !codeVerifier) return;

  const { client: loggedInClient } = await twitterAuthClient.loginWithOAuth2({
    code: typeof code === "string" ? code : code?.[0],
    codeVerifier:
      typeof codeVerifier === "string" ? codeVerifier : codeVerifier?.[0],
    redirectUri: `${ENVIRONMENT_URL}/twitter-redirect`,
  });

  const { data: userObject } = await loggedInClient.v2.me();

  const { update_users } = await request({
    url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
    document: UPDATE_USER_TWITTER,
    variables: {
      walletAddress,
      twitterUsername: userObject.username,
      twitterName: userObject.name,
      twitterId: userObject.id,
    },
    requestHeaders: {
      "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
    },
  });

  // const { } = update_users

  console.log({ update_users });
  res.json({ update_users });
}
