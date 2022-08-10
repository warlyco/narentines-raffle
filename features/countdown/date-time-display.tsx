type Props = {
  value: number;
  type: string;
  isDanger?: boolean;
};

const DateTimeDisplay = ({ value, type, isDanger }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center  px-2 w-1/4 rounded-lg leading-3">
      <div className="mt-2 text-3xl">{value}</div>
      <div className="text-sm uppercase mb-1">{type}</div>
    </div>
  );
};

export default DateTimeDisplay;
