import typography from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';

export default {
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
    typography,
    aspectRatio,
  ],
};
