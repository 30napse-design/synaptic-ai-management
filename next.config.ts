import { resolve } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  env: { SYNAPSE_STANDALONE_BUILD: "1" },
  webpack(config, { webpack }) {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".mjs": [".mts", ".mjs"],
    };
    config.module.rules.push({
      test: /\.ttf$/,
      resourceQuery: /^\?inline$/,
      use: resolve("runtime/inline-font.cjs"),
    });
    config.plugins.push(new webpack.NormalModuleReplacementPlugin(
      /^cloudflare:workers$/,
      resolve("runtime/hostinger-env.mjs"),
    ));
    return config;
  },
};

export default nextConfig;
