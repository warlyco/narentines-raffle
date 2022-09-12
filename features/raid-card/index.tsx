import bg from "public/images/single-item-bg.png";
import dayjs from "dayjs";
import { Raid } from "types/types";
import RaidCountdown from "features/raid-countdown";

type Props = {
  raid: Raid;
};

const RaidCard = ({ raid }: Props) => {
  const {
    tweetId,
    tweetText,
    tweetUrl,
    posterUsername,
    payoutAmountInGoods,
    raidLengthInHours,
    createdAt,
  } = raid;
  return (
    <a
      className="w-full p-4 bg-amber-200 space-y-1 flex-shrink-0 rounded-lg flex flex-col justify-between relative shadow-deep hover:shadow-deep-float hover:scale-[1.03] duration-500"
      style={{ backgroundImage: `url(${bg.src})` }}
      href={tweetUrl}
      key={tweetId}
      target="_blank"
      rel="noreferrer"
    >
      <div className="w-full bg-green-800 text-amber-200 text-xl text-center py-2 rounded-t-lg absolute left-0 top-0">
        {payoutAmountInGoods} $GOODS
      </div>
      <div className="flex flex-1 pt-10">
        <div className="font-bold mr-2 text-lg mb-2 line-clamp-2">
          {tweetText}
        </div>
      </div>
      <div className="flex">
        <div>
          <div className="font-bold mr-2">Tweeted by:</div>
        </div>
        <div>{posterUsername}</div>
      </div>
      <div className="flex">
        <div>
          <div className="font-bold mr-2">Ends at:</div>
        </div>
        <div>
          {dayjs(createdAt)
            .add(raidLengthInHours, "hour")
            .format("M/D/YY, h:mm a")}
        </div>
      </div>
      <div className="flex">
        <div>
          <div className="font-bold mr-2">Time remaining:</div>
        </div>
        <RaidCountdown raid={raid} />
      </div>
    </a>
  );
};

export default RaidCard;
