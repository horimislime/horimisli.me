module.exports = {
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            li: {
              '& p': {
                marginTop: '0.5em',
                marginBottom: '0.5em',
              },
            },
          },
        },
      }),
    },
  },
  content: ['./src/**/*.tsx', './posts/blog/**/*.md'],
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
