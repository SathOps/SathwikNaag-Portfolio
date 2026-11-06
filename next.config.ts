import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp'],
    deviceSizes: [480, 768, 1080, 1440, 1920],
    imageSizes: [96, 160, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // keep the big raw design inbox out of the build
  outputFileTracingExcludes: { '*': ['./inbox/**', './public/work/**/*.mp4'] },
};

export default nextConfig;
