import type { NextConfig } from 'next';

const config: NextConfig = {
  output: process.env.PAIRWISE_STATIC_EXPORT === '1' ? 'export' : undefined,
  turbopack: { root: process.cwd() },
};

export default config;
