const verifyAdmin = (publicKey: string) => {
  const adminWallets = process.env.NEXT_PUBLIC_ADMIN_WALLETS;
  if (!adminWallets) throw new Error("Missing admin wallet addresses");
  return adminWallets.includes(publicKey);
};

export default verifyAdmin;
