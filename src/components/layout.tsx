import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

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
          <>
            <meta name="twitter:card" content="summary_large_image" />
            <meta
              property="og:image"
              content={`https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}${params.ogImagePath}`}
            />
          </>
        ) : (
          <meta name="twitter:card" content="summary" />
        )}
      </Head>
      <header className="py-4">
        <div
          className="text-xl flex space-x-4 justify-between"
          role="navigation"
        >
          <HomeButton />
          <div className="border-2 border-transparent px-2 py-1">
            <div className="menu justify-between">
              {/* <Link href="/entry">
                <a className="ml-4 border-b-4 border-gray-800 font-semibold hover:text-blue-600">
                  Posts
                </a>
              </Link>
              <Link href="/about">
                <a className="ml-4 font-semibold hover:text-blue-600">About</a>
              </Link> */}
            </div>
          </div>
        </div>
      </header>
      <hr className="p-4" />
      <main className="prose prose-sm lg:prose-lg max-w-none mb-12">
        {params.children}
      </main>
      {params.showTweetButton === true ? (
        <>
          <TweetButton
            title={params.title ?? process.env.NEXT_PUBLIC_SITE_NAME}
            path={useRouter().asPath}
          />
          <hr className="mt-8" />
        </>
      ) : (
        <hr />
      )}
      <footer className="p-4 text-center">
        ©︎ {process.env.NEXT_PUBLIC_SITE_AUTHOR} <br />
        {/* Served by{' '}
        <a
          href="https://github.com/horimislime/horimisli.me"
          className="underline font-medium"
        >
          horimislime/horimisli.me
        </a> */}
      </footer>
    </div>
  );
};

export default Layout;
