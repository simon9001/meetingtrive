import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/dashboard",          destination: "/app",        permanent: false },
      { source: "/dashboard/:path*",   destination: "/:path*",     permanent: false },
    ]
  },
};

export default nextConfig;
