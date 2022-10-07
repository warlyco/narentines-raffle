import bigDecimal from "js-big-decimal";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { isProduction } from "constants/constants";
import showToast from "features/toasts/show-toast";
import client from "graphql/apollo-client";
import { GET_RAFFLES } from "graphql/queries/get-raffles";
import { GET_TEST_RAFFLES } from "graphql/queries/get-test-raffles";
import { Raffle, SplTokens } from "types/types";

export const createSolanaTransaction = ({
  numberOfTicketsToBuy,
  fromPublicKey,
  toPublicKey,
  pricePerTicket,
}: {
  numberOfTicketsToBuy: number;
  pricePerTicket: number;
  fromPublicKey: PublicKey;
  toPublicKey: PublicKey;
}) => {
  const bdNumberOfTicketsToBuy = new bigDecimal(numberOfTicketsToBuy);
  const bdPricePerTicket = new bigDecimal(pricePerTicket);
  // @ts-ignore
  const amountOfSol = Number(
    bigDecimal.multiply(numberOfTicketsToBuy, pricePerTicket)
  );
  console.log({
    amountOfSol,
    numberOfTicketsToBuy,
    pricePerTicket,
  });
  const solInLamports = Number(
    bigDecimal.multiply(LAMPORTS_PER_SOL, amountOfSol)
  );
  return new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: toPublicKey,
      lamports: solInLamports,
    })
  );
};

export const getTokenMintAddress = (token: SplTokens) => {
  if (
    !process.env.NEXT_PUBLIC_GOODS_TOKEN_MINT_ADDRESS ||
    !process.env.NEXT_PUBLIC_DUST_TOKEN_MINT_ADDRESS ||
    !process.env.NEXT_PUBLIC_FORGE_TOKEN_MINT_ADDRESS ||
    !process.env.NEXT_PUBLIC_GEAR_TOKEN_MINT_ADDRESS ||
    !process.env.NEXT_PUBLIC_SOL_TOKEN_MINT_ADDRESS
  ) {
    console.log("error", "Missing environment variables!");
    return;
  }

  switch (token) {
    case SplTokens.GOODS:
      return process.env.NEXT_PUBLIC_GOODS_TOKEN_MINT_ADDRESS;
    case SplTokens.DUST:
      return process.env.NEXT_PUBLIC_DUST_TOKEN_MINT_ADDRESS;
    case SplTokens.FORGE:
      return process.env.NEXT_PUBLIC_FORGE_TOKEN_MINT_ADDRESS;
    case SplTokens.GEAR:
      return process.env.NEXT_PUBLIC_GEAR_TOKEN_MINT_ADDRESS;
    case SplTokens.SOL:
      return process.env.NEXT_PUBLIC_SOL_TOKEN_MINT_ADDRESS;
  }
};

export const checkIfPurchaseIsAllowed = async (
  raffle: Raffle,
  numberOfTicketsToBuy: number
) => {
  return new Promise(async (resolve, reject) => {
    const query = isProduction ? GET_RAFFLES : GET_TEST_RAFFLES;

    const { data } = await client.query({
      query,
      fetchPolicy: "no-cache",
    });

    const updatedRaffle = data.raffles.find(
      ({ id }: Raffle) => id === raffle.id
    );

    if (!updatedRaffle) {
      showToast({ primaryMessage: "Unkown raffle" });
      reject("Unkown raffle");
      throw new Error("Unkown raffle");
    }

    const { totalTicketCount, soldTicketCount } = updatedRaffle;
    if (totalTicketCount - soldTicketCount <= 0) {
      showToast({ primaryMessage: "Raffle is sold out!" });
      reject("Raffle is sold out!");
      throw new Error("Raffle is sold out!");
    }
    if (totalTicketCount - soldTicketCount < Number(numberOfTicketsToBuy)) {
      showToast({ primaryMessage: "Not enough }tickets left" });
      reject("Not enough tickets left");
      throw new Error("Not enough tickets left");
    }

    resolve(true);
  });
};
