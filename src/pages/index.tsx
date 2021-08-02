import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import EntryList from '../components/entry';
import Layout from '../components/layout';
import { Entry, listEntries } from '../entities/Entry';

type Props = {
  entries: Entry[];
};

const Home: NextPage<Props> = (props) => {
  return (
    <Layout>
      <Head>
        <title>{process.env.NEXT_PUBLIC_SITE_NAME}</title>
      </Head>
      <section className="flex items-center p-4">
        <div className="m-4">
          <img
            src="/images/profile.jpg"
            width="80"
            height="80"
            className="border-gray-400 rounded-full object-fill h-auto w-20"
            alt="My profile image"
          />
        </div>
        <p className="">
          ここは horimislime (Soichiro HORIMI) の個人ホームページです。
          <br />
          ブログ記事のアーカイブは <Link href="/entry">こちら</Link> をどうぞ。
        </p>
      </section>
      <section className="m-4">
        <h1 className="text-2xl m-2">最近の記事</h1>
        <EntryList entries={props.entries} />
      </section>
      <section className="m-4">
        <h1 className="text-2xl m-2">各種リンク</h1>
        <ul className="list-none m-4">
          <li>
            <a
              href="https://github.com/horimislime"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href="https://qiita.com/horimislime"
              target="_blank"
              rel="noreferrer"
            >
              Qiita
            </a>
          </li>
          <li>
            <a
              href="https://stackoverflow.com/users/1430224/horimislime"
              target="_blank"
              rel="noreferrer"
            >
              Stack Overflow
            </a>
          </li>
          <li>
            <a
              href="https://speakerdeck.com/horimislime"
              target="_blank"
              rel="noreferrer"
            >
              Speaker Deck
            </a>
          </li>
          <li>
            <a
              href="https://twitter.com/horimislime"
              target="_blank"
              rel="noreferrer"
            >
              Twitter
            </a>
          </li>
          <li>
            <a
              href="https://horimislime.hateblo.jp"
              target="_blank"
              rel="noreferrer"
            >
              はてなブログ（旧ブログ）
            </a>
          </li>
        </ul>
      </section>
    </Layout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps<Props> = async () => {
  const entries = await listEntries(5);
  return {
    props: {
      entries,
    },
  };
};
