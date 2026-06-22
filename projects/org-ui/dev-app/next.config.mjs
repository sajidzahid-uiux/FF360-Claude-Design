import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@fieldflow360/org-ui'],
  outputFileTracingRoot: path.join(__dirname, ".."),
  // Keep dev and build artifacts isolated to avoid cache corruption
  // when `next dev` and `next build` are run around the same time.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
