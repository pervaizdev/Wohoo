/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "wohoo-api-1e8a38739a3b.herokuapp.com"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.yourdomain.com", // replace with your prod host later
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
