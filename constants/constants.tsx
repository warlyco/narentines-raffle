import { SplTokens } from "types/types";

export const GOODS_TOKEN_MINT_ADDRESS: string =
  process.env.NEXT_PUBLIC_GOODS_TOKEN_MINT_ADDRESS || "";
export const RAID_PAYOUT_WALLET_ADDRESS: string =
  process.env.NEXT_PUBLIC_RAID_PAYOUT_WALLET_ADDRESS || "";
export const CREATOR_MINT_ID: string =
  process.env.NEXT_PUBLIC_CREATOR_MINT_ID || "";
export const ENVIRONMENT_URL: string =
  process.env.NEXT_PUBLIC_ENVIRONMENT_URL || "";
export const TWITTER_CLIENT_ID: string =
  process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || "";
export const TWITTER_REDIRECT_URI: string = `${process.env.NEXT_PUBLIC_ENVIRONMENT_URL}/twitter-redirect`;

export const RPC_ENDPOINT: string = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "";
export const SOLANA_CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "";
export const SENTRY_TRACE_SAMPLE_RATE = 0.3;
export const MINT_ADDRESSES = {
  [SplTokens.SOL]: "11111111111111loca111111111111111111",
  [SplTokens.GOODS]: "C1FfuXjR9xZxJMNSMW3YRVEdLQhso1HUWRAZjtPbx4Rm",
  [SplTokens.GEAR]: "7s6NLX42eURZfpyuKkVLrr9ED9hJE8718cyXFsYKqq5g",
  [SplTokens.FORGE]: "FoRGERiW7odcCBGU1bztZi16osPBHjxharvDathL5eds",
  [SplTokens.DUST]: "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ",
};

export const isProduction = process.env.NEXT_PUBLIC_ENV === "production";
