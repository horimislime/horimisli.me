import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

import EntryList from '../../components/entry';
import Layout from '../../components/layout';
import { Entry, listEntries } from '../../entities/Entry';

type Props = {
  entries: Entry[];
};

const Archive: NextPage<Props> = (props) => {
  return (
    <Layout>
      <Head>
        <title>記事一覧</title>
      </Head>
      <section className="m-4">
        <EntryList entries={props.entries} />
      </section>
    </Layout>
  );
};

export default Archive;

export const getStaticProps: GetStaticProps<Props> = async () => {
  const entries = await listEntries();
  return {
    props: {
      entries,
    },
  };
};
