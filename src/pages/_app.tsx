import 'prismjs/themes/prism-tomorrow.css';
import 'tailwindcss/tailwind.css';

import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return <Component {...pageProps} />;
}