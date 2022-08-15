import { JsonMetadata, Nft } from "@metaplex-foundation/js";

export type NftWithMeta = {
  nft: Nft;
  meta: JsonMetadata;
};

export type Raffle = {
  id: string;
  name: string;
  mintAddress: string;
  endsAt: string;
  createdAt: string;
  startsAt: string;
  updatedAt: string;
  totalTicketCount: number;
  soldTicketCount: number;
  priceInGoods: number;
  priceInSol: number;
  priceInDust: number;
  priceInForge: number;
  priceInGear: number;
  imgSrc: string;
  winner?: string;
  winners: string[];
  totalWinnerCount: number;
  isArchived: boolean;
  projectWebsiteUrl: string;
  projectTwitterUrl: string;
  projectDiscordUrl: string;
};

export type RaffleEntry = {
  walletAddress: string;
  count: number;
};

export type RaffleResponse = {
  raffle: Raffle;
};

export type ArchiveRaffleResponse = {
  id: string;
  isArchived: boolean;
  name: string;
};

export type RaffleWinnerResponse = {
  id: string;
  winner: string;
};

export type RaffleWinnersResponse = {
  id: string;
  winners: string[];
};

export type RaffleEntryResponse = {
  updatedCount: number;
  id: string;
  updatedSoldCount: number;
};

export type RafflesResponse = {
  raffles: Raffle[];
};

export enum SplTokens {
  SOL = "SOL",
  GOODS = "GOODS",
  DUST = "DUST",
  FORGE = "FORGE",
  GEAR = "GEAR",
}

export type DiscordUser = {
  accent_color: string;
  avatar: string;
  avatar_decoration: string;
  banner: string;
  banner_color: string;
  discriminator: string;
  flags: number;
  id: string;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
  public_flags: number;
  username: string;
};

export type User = {
  id: string;
  username: string;
  avatarUrl: string;
  discordName: string;
  walletAddress: string;
};

type VercelJob = {
  id: string;
  state: string;
  createdAt: number;
};

export type VercelJobResponse = {
  job: VercelJob;
};

export enum ModalTypes {
  SENDING_TRNASACTION = "SENDING_TRNASACTION",
}
