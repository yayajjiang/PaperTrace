/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  experimental: { cpus: 2 },
  basePath: process.env.NODE_ENV === "production" ? "/PaperTrace" : "",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
