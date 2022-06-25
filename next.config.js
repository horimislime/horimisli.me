const withPlugins = require('next-compose-plugins');
const optimizedImages = require('next-optimized-images');
const { resolve } = require("path")

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@public'] = resolve(__dirname, 'public');
    return config;
  },
  trailingSlash: true,
  images: {
    disableStaticImages: true
  }
};

const imgConfig = {
  imagesFolder: 'images',
  handleImages: ['jpeg', 'png', 'gif'],
  // optimizeImagesInDev: true,
  mozjpeg: {
    quality: 80
  },
  optipng: {
    quality: 80
  }
};

module.exports = withPlugins([[optimizedImages, imgConfig]], nextConfig);
