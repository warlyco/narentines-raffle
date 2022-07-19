export const Footer = () => (
  <footer className="w-full sticky bottom-0 bg-black text-amber-400 px-4">
    <div className="flex justify-between max-w-6xl mx-auto py-4">
      <div className="text-4xl">SWAMP LABS</div>
      <div className="flex flex-col">
        <div>Join us on social media</div>
        <div className="flex justify-between">
          <div>twitter</div>
          <div>discord</div>
          <div>medium</div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-2xl">Narentines</div>
        <div>Carbon Neutral Network</div>
      </div>
    </div>
  </footer>
);

export default Footer;
