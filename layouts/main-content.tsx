export const MainContent = ({ children }: { children: any }) => (
  <div className="h-full min-h-screen bg-amber-400 w-full flex flex-col flex-1 items-center">
    <div className="w-full h-full max-w-5xl mx-auto">
      <div className="px-4 h-full w-full">{children}</div>
    </div>
  </div>
);
