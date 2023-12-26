import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

import { TwitterCardImage } from './image';
import TweetButton from './tweet_button';

const HomeButton = dynamic(() => import('./button'), { ssr: false });

const Layout = (params: {
  children: ReactNode;
  title?: string;
  ogImagePath?: string;
  showTweetButton?: boolean;
}): JSX.Element => {
  return (
    <div className="max-w-4xl m-6 lg:m-auto">
      <Head>
        <link rel="icon" href="/favicon.png" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="horimisli.me"
          href="/feed.xml"
        />
        <meta
          name="og:title"
          content={params.title ?? process.env.NEXT_PUBLIC_SITE_NAME}
        />
        <meta name="description" content="Personal website by horimislime" />
        {params.ogImagePath ? (
          <TwitterCardImage imagePath={params.ogImagePath} />
        ) : (
          <meta name="twitter:card" content="summary" />
        )}
      </Head>
      <header className="py-4">
        <div className="text-xl flex gap-4" role="navigation">
          <HomeButton />
          <div className="flex items-center">
            <Link href="/entry" className="flex underline font-semibold">Archive</Link>
          </div>
          <div className="flex items-center">
            <a className="flex underline font-semibold" href="/feed.xml">Feed</a>
          </div>
        </div>
      </header>
      <hr className="p-4" />
      <main className="prose max-w-none mb-12 prose-img:mb-0 prose-img:mt-0 prose-headings:pt-4">
        {params.children}
      </main>
      {params.showTweetButton === true ? (
        <>
          <TweetButton
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            title={params.title ?? process.env.NEXT_PUBLIC_SITE_NAME!}
            path={useRouter().asPath}
          />
          <hr className="mt-8" />
        </>
      ) : (
        <hr />
      )}
      <footer className="p-4 text-center">
        ©︎ {process.env.NEXT_PUBLIC_SITE_AUTHOR} <br />
        Served by{' '}
        <a
          href="https://github.com/horimislime/horimisli.me"
          className="underline font-medium"
        >
          horimislime/horimisli.me
        </a>
      </footer>
    </div>
  );
};

export default Layout;
