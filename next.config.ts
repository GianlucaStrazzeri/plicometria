import type { NextConfig } from "next";

// Next PWA integration — requires installing `next-pwa`.
// Install with: `npm install next-pwa`
let withPWA: any = (x: any) => x;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const _with = require("next-pwa");
  // _with can be a function; call with options
  withPWA = _with({ dest: "public", register: true, skipWaiting: true, disable: process.env.NODE_ENV !== "production" });
} catch (err) {
  // next-pwa not installed — fallback to identity
  // console.warn("next-pwa not installed; PWA disabled in config");
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig) as NextConfig;
