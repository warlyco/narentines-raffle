import { SplTokens } from "types/types";

export const CREATOR_MINT_ID: string =
  process.env.NEXT_PUBLIC_CREATOR_MINT_ID || "";

export const RPC_ENDPOINT: string = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "";
export const SOLANA_CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "";
export const SENTRY_TRACE_SAMPLE_RATE = 0.3;
export const MINT_ADDRESSES = {
  [SplTokens.SOL]: "11111111111111111111111111111111",
  [SplTokens.GOODS]: "C1FfuXjR9xZxJMNSMW3YRVEdLQhso1HUWRAZjtPbx4Rm",
};

export const isProduction = process.env.NEXT_PUBLIC_ENV === "production";
