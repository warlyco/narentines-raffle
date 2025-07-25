import bg from "public/images/single-item-bg.png";

const LoadingRaffleCard = () => (
  <div
    className="w-full p-4 bg-amber-200 space-y-2 flex-shrink-0 rounded-lg flex flex-col justify-between relative"
    style={{ backgroundImage: `url(${bg.src})` }}
  >
    <div className="w-full object-cover lg:max-h-[280px] mb-2 h-[250px] bg-slate-500 animate-pulse"></div>
    <div className="space-y-4">
      <div className="py-6">
        <div className="w-full flex h-12 bg-slate-500 animate-pulse rounded"></div>
      </div>
      <div className="w-full flex h-8 bg-slate-500 animate-pulse rounded"></div>
      <div className="w-full flex h-8 bg-slate-500 animate-pulse rounded"></div>
      <div className="w-full flex h-8 bg-slate-500 animate-pulse rounded"></div>
      <div className="w-full flex h-8 bg-slate-500 animate-pulse rounded"></div>
    </div>
  </div>
);

export default LoadingRaffleCard;
