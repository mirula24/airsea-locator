import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Penting untuk Docker
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
