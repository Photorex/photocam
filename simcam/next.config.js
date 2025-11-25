/** @type {import('next').NextConfig} */
const nextConfig = {
    generateBuildId: async () => {
        return `build-${Date.now()}`;
    },
    async rewrites() {
        return [
          {
            source: '/reset',
            destination: '/api/recover',
          },
        ];
    },
    webpack(config) {
      // Find existing rule handling SVGs, if needed
      const fileLoaderRule = config.module.rules.find((rule) =>
        rule.test?.test?.('.svg')
      );
  
      // Add custom rules for handling .svg files
      config.module.rules.push(
        // 1. Let @svgr/webpack handle all SVGs *except* app/icon.svg
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          resourceQuery: { not: [/url/] }, // Ignore `?url`
          exclude: /app\/icon\.svg$/, // ❗ exclude app/icon.svg from SVGR
          use: ['@svgr/webpack'],
        }
      );
  
      return config;
    },
  
    experimental: {
      turbo: {
        rules: {
          // Let Turbopack use SVGR, but avoid icon.svg
          "*.svg": {
            loaders: ["@svgr/webpack"],
            as: "*.js",
            exclude: ["app/icon.svg"], // ❗ exclude app/icon.svg
          },
        },
      },
    },
  };
  
  module.exports = nextConfig;