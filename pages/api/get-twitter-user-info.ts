import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import axios from "axios";
import { TwitterApi } from "twitter-api-v2";
import { ENVIRONMENT_URL, TWITTER_CLIENT_ID } from "constants/constants";
import twitterAuthClient from "utils/auth/twitter-auth-client";

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

  const { code, codeVerifier } = req.query;
  console.log({ code, codeVerifier });
  if (!code || !codeVerifier) return;

  const { client: loggedInClient } = await twitterAuthClient.loginWithOAuth2({
    code: typeof code === "string" ? code : code?.[0],
    codeVerifier:
      typeof codeVerifier === "string" ? codeVerifier : codeVerifier?.[0],
    redirectUri: `${ENVIRONMENT_URL}/twitter-redirect`,
  });

  const { data: userObject } = await loggedInClient.v2.me();

  console.log(userObject);

  // Rest of the API logic
  res.json({ userObject });
}
