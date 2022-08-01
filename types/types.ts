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
  imgSrc: string;
  winner?: string;
  winners: string[];
  totalWinnerCount: number;
  isArchived: boolean;
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
  updatedSoldCount: number;
};

export type RafflesResponse = {
  raffles: Raffle[];
};
