module.exports = {
  theme: {
    extend: {
      colors: {
        'hbBlue': '#00A4DE',
        'bsBlue': '#1185FE',
      },
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
