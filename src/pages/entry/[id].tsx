import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { ParsedUrlQuery } from 'querystring';

import Date from '../../components/date';
import Layout from '../../components/layout';
import { Entry, findEntryById, getAllEntryIds } from '../../entities/Entry';
type Props = {
  entry: Entry;
};

interface Params extends ParsedUrlQuery {
  id: string;
}

const EntryPage: NextPage<Props> = (props) => {
  return (
    <>
      <Layout
        title={props.entry.title}
        ogImagePath={props.entry.image}
        showTweetButton={true}
      >
        <Head>
          <title>{props.entry.title}</title>
        </Head>
        <article>
          <h1>{props.entry.title}</h1>
          <div className="text-lg text-gray-500">
            <Date dateString={props.entry.date} />
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: props.entry.content ?? '' }}
          />
        </article>
      </Layout>
    </>
  );
};

export default EntryPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllEntryIds();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props, Params> = async (
  context,
) => {
  if (context.params) {
    const entry = await findEntryById(context.params.id, true);
    return {
      props: {
        entry,
      },
    };
  }
  return { notFound: true };
};
