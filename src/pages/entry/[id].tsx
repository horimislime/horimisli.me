import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { ParsedUrlQuery } from 'querystring';
import ReactMarkdown from 'react-markdown'

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
          <div className="text-lg text-gray-500 mb-8">
            <Date dateString={props.entry.date} />
          </div>
          <ReactMarkdown
            components={{
              img({node}) {
                  const alt = node.properties.alt as string
                  const path = node.properties.src as string;
                  const filename = path.replace('/images/', '');
                  const showOptimizedImage = process.env.NODE_ENV === 'production' && !path.startsWith('http');

                  return (
                    <div className="image-container py-6 flex flex-col space-y-2">
                    {showOptimizedImage ?
                      (<img src={require(`@public/images/${filename}`)} alt={alt} />) :
                      (<img src={path} alt={alt} />)
                    }
                    {alt.length > 0 ?
                      <div className="caption text-sm text-gray-500 text-center" aria-label={alt}>{alt}</div> :
                      null
                    }
                    </div>
                  )
              }
            }}>
            {props.entry.content}
          </ReactMarkdown>
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
