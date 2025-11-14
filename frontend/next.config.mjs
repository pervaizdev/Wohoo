/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Local backend
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },

      // Your old API domains
      {
        protocol: "https",
        hostname: "api.yourdomain.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "wohoo-3495d51dbaaf.herokuapp.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "wohoo-api-1e8a38739a3b.herokuapp.com",
        pathname: "/uploads/**",
      },

      // 🚀 Cloudinary (the new images)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**", // must allow ALL cloudinary paths
      },
    ],
  },
};

export default nextConfig;
