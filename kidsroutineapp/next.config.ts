import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile @botpress/client to handle CommonJS dependencies
  transpilePackages: ["@botpress/client"],
  webpack: (config) => {
    // Workaround: impede que generator.asset (com filename) seja aplicado em asset/inline
    if (config.module?.generator?.asset) {
      config.module.generator["asset/resource"] =
        config.module.generator["asset"];
      config.module.generator["asset/source"] =
        config.module.generator["asset"];
      delete config.module.generator["asset"];
    }

    return config;
  },
};

export default nextConfig;