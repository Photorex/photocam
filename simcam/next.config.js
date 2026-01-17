/** @type {import('next').NextConfig} */
const nextConfig = {
    generateBuildId: async () => {
        return `build-${Date.now()}`;
    },
    images: {
        // Limit image optimization cache to prevent memory leaks
        minimumCacheTTL: 60,              // Cache for 60 seconds only
        deviceSizes: [640, 750, 828, 1080, 1200], // Reduce device sizes
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Reduce image sizes
        formats: ['image/webp'],          // Only WebP, no AVIF (saves memory)
        dangerouslyAllowSVG: true,
        contentDispositionType: 'inline',
        // Limit concurrent optimizations
        unoptimized: false,
    },
    async rewrites() {
        return [
          {
            source: '/reset',
            destination: '/api/recover',
          },
        ];
    },
    async headers() {
        return [
          {
            // Apply security headers to all routes
            source: '/:path*',
            headers: [
              {
                key: 'X-DNS-Prefetch-Control',
                value: 'on'
              },
              {
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload'
              },
              {
                key: 'X-Frame-Options',
                value: 'SAMEORIGIN'
              },
              {
                key: 'X-Content-Type-Options',
                value: 'nosniff'
              },
              {
                key: 'X-XSS-Protection',
                value: '1; mode=block'
              },
              {
                key: 'Referrer-Policy',
                value: 'strict-origin-when-cross-origin'
              },
              {
                key: 'Permissions-Policy',
                value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
              }
            ],
          },
          {
            // Special CSP for user-uploaded images to prevent XSS
            source: '/api/user/images/:path*',
            headers: [
              {
                key: 'Content-Security-Policy',
                value: "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'none';"
              },
              {
                key: 'X-Content-Type-Options',
                value: 'nosniff'
              },
              {
                key: 'Content-Disposition',
                value: 'inline'
              }
            ],
          }
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