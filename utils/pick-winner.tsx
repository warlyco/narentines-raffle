import { RaffleEntry } from "types/types";

const selectContestants = (entries: RaffleEntry[]) => {
  let contestants = [];
  for (const entry of entries) {
    for (let i = 0; i < entry.count; i++) {
      contestants.push(entry.walletAddress);
    }
  }
  return contestants;
};

const selectWinningWalletAddress = (contestants: string[]) => {
  const randomContenstantIndex = Math.floor(Math.random() * contestants.length);
  return contestants[randomContenstantIndex];
};

export const selectWinner = (entries: RaffleEntry[]) => {
  const contestants = selectContestants(entries);
  return selectWinningWalletAddress(contestants);
};

export const selectWinners = ({
  entries,
  numberOfWinnersToPick,
}: {
  entries: RaffleEntry[];
  numberOfWinnersToPick: number;
}) => {
  const winnerWalletAddresses: string[] = [];
  const contestants = selectContestants(entries);

  while (
    winnerWalletAddresses.length < numberOfWinnersToPick &&
    winnerWalletAddresses.length < entries.length
  ) {
    const newWinner = selectWinningWalletAddress(contestants);
    if (!winnerWalletAddresses.includes(newWinner)) {
      winnerWalletAddresses.push(newWinner);
    }
  }

  if (winnerWalletAddresses.length > numberOfWinnersToPick) {
    throw new Error("Too many winners");
  }

  if (
    winnerWalletAddresses.length < numberOfWinnersToPick &&
    winnerWalletAddresses.length < entries.length
  ) {
    throw new Error("Not enough winners");
  }

  return winnerWalletAddresses;
};

export default selectWinners;
