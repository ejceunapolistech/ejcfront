import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
        "http://ec2-18-222-22-189.us-east-2.compute.amazonaws.com:8080/ejceunapolis/api/public/:path*",
      },
    ];
  },
};

export default nextConfig;
