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
        source: '/entry/:slug/:filename(.*\\.(?:png|jpg|gif))',
        destination: '/images/:filename',
      },
    ]
  },
};

export default nextConfig;
