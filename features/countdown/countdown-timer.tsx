import React from "react";
import { useCountdown } from "hooks/use-countdown";
import DateTimeDisplay from "./date-time-display";

type Props = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const ShowCounter = ({ days, hours, minutes, seconds }: Props) => {
  return (
    <div className="flex justify-between">
      <DateTimeDisplay
        value={days}
        type={days === 1 ? "Day" : "Days"}
        isDanger={days <= 3}
      />

      <DateTimeDisplay value={hours} type={"Hr"} isDanger={false} />

      <DateTimeDisplay value={minutes} type={"Min"} isDanger={false} />

      <DateTimeDisplay value={seconds} type={"Sec"} isDanger={false} />
    </div>
  );
};

const CountdownTimer = ({ endsAt }: { endsAt: string }) => {
  const [days, hours, minutes, seconds] = useCountdown(endsAt);

  return (
    <ShowCounter
      days={days}
      hours={hours}
      minutes={minutes}
      seconds={seconds}
    />
  );
};

export default CountdownTimer;
