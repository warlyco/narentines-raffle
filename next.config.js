/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["place-hold.it", "gateway.pinata.cloud", "cdn.discordapp.com"],
  },
};

module.exports = nextConfig;
