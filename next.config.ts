import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "stealdeals-public-assets.s3.ap-southeast-1.amazonaws.com",
        port: "",
        pathname: "/surprise-bags/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
