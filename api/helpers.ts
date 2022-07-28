export const handleSolTransaction = () => {
  // try {
  //   const { data } = await refetch();
  //   const updatedRaffle = data?.raffles?.find(
  //     (r: Raffle) => r.id === raffle.id
  //   );
  //   const { totalTicketCount, soldTicketCount } = updatedRaffle;
  //   if (totalTicketCount - soldTicketCount <= 0) {
  //     toast("Raffle is sold out!");
  //     throw new Error("Raffle is sold out!");
  //     return;
  //   }
  //   // SOL
  //   const solInLamports =
  //     (LAMPORTS_PER_SOL / 100) * Number(numberOfTicketsToBuy);
  //   const transaction = new Transaction().add(
  //     SystemProgram.transfer({
  //       fromPubkey: fromPublicKey,
  //       toPubkey: new PublicKey(process.env.NEXT_PUBLIC_COLLECTION_WALLET),
  //       lamports: solInLamports,
  //     })
  //   );
};
