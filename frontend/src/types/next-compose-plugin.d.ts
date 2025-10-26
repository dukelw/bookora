// src/types/next-compose-plugins.d.ts
declare module "next-compose-plugins" {
  import { NextConfig } from "next";
  type Plugin = (nextConfig: NextConfig) => NextConfig;
  export default function withPlugins(
    plugins: (Plugin | [Plugin, NextConfig])[],
    nextConfig?: NextConfig
  ): NextConfig;
}
