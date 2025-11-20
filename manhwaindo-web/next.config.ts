import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.gmbr.pro',
      },
      {
        protocol: 'https',
        hostname: '**.wp.com',
      },
      {
        protocol: 'https',
        hostname: '**.kambingjantan.cc',
      },
      {
        protocol: 'https',
        hostname: 'manhwaindo.app',
      },
      {
        protocol: 'https',
        hostname: '**.manhwaindo.app',
      },
    ],
  },
};

export default nextConfig;
