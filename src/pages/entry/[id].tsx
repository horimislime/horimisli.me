import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { ParsedUrlQuery } from 'querystring';
import ReactMarkdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dracula} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import rehypeRaw from "rehype-raw";
import remarkUnwrapImages from 'remark-unwrap-images';

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
            remarkPlugins={[remarkUnwrapImages]}
            rehypePlugins={[rehypeRaw]}
            disallowedElements={['figure']}
            components={{
              img({node}) {
                  const alt = (node.properties?.alt ?? '') as string
                  const path = (node.properties?.src ?? '') as string;
                  const filename = path.replace('/images/', '');
                  const showOptimizedImage = !path.startsWith('http');
                  let imageSrc = '';
                  try {
                    imageSrc = require(`@public/images/${filename}`);
                  } catch (_) {
                    // Workaround for Renovate CI
                  }

                  return (
                    <figure className="image-container py-6 flex flex-col space-y-2">
                    {showOptimizedImage ?
                      (<img src={imageSrc} alt={alt} />) :
                      (<img src={path} alt={alt} />)
                    }
                    {alt.length > 0 ?
                      <figcaption className="caption text-sm text-gray-500 text-center" aria-label={alt}>{alt}</figcaption> :
                      null
                    }
                    </figure>
                  )
              },
              code({inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                const innerElement = String(children).replace(/\n$/, '')
                const styles = { background: "inherit", margin: "0px" }

                return !inline && match ? (
                  <SyntaxHighlighter
                    style={dracula}
                    language={match[1]}
                    PreTag="div"
                    customStyle={styles}
                  >
                    {innerElement}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
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
