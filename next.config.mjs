/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: "http://72.60.78.25/api/:path*",
    },
  ];
},

};

export default nextConfig;