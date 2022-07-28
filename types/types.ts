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
};

export type RaffleResponse = {
  raffle: Raffle;
};

export type RaffleEntryResponse = {
  updatedCount: number;
};

export type RafflesResponse = {
  raffles: Raffle[];
};
