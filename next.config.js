/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["better-sqlite3"],
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

module.exports = nextConfig;
