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
  winners: JSON;
  totalWinnerCount: number;
};

export type RaffleResponse = {
  raffle: Raffle;
};

export type RaffleWinnerResponse = {
  id: Raffle;
  winner: string;
};

export type RaffleEntryResponse = {
  updatedCount: number;
  updatedSoldCount: number;
};

export type RafflesResponse = {
  raffles: Raffle[];
};
