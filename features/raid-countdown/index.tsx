import dayjs from "dayjs";
import React from "react";
import Countdown from "react-countdown";
import { Raid } from "types/types";

const Completed = () => <span className="italic">This raid has ended</span>;

const RaidCountdown = ({ raid }: { raid: Raid }) => {
  const { createdAt, raidLengthInHours } = raid;
  const date = dayjs(createdAt).add(raidLengthInHours, "hour").format();
  return (
    <Countdown date={date}>
      <Completed />
    </Countdown>
  );
};

export default RaidCountdown;
