import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPlugins from "next-compose-plugins";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/i18n.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cloudinary-marketing-res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default withFlowbiteReact(withPlugins([withNextIntl], nextConfig));
