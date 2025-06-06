const isProduction = process.env.NODE_ENV === 'production';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: isProduction ? 'export' : 'standalone',
  trailingSlash: true,
  rewrites: isProduction ? undefined : async () => {
    return [
      {
        source: '/entry/:slug/:filename(.*\\.(?:png|jpg|jpeg|gif|webp|svg))',
        destination: '/images/:slug/:filename',
      },
    ]
  },
};

export default nextConfig;
