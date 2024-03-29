import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { ParsedUrlQuery } from 'querystring';
import { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dracula} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import rehypeRaw from "rehype-raw";
import remarkUnwrapImages from 'remark-unwrap-images';

import Date from '../../components/date';
import { Image } from '../../components/image';
import Layout from '../../components/layout';
import { Entry, findEntryById, getAllEntryIds } from '../../entities/Entry';

type Props = {
  entry: Entry;
};

interface Params extends ParsedUrlQuery {
  id: string;
}

const EntryPage: NextPage<Props> = (props) => {
  return <>
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

          <small className="text-sm flex">
            <Date dateString={props.entry.date} />
              <div className="flex ml-2">
                {Array.from(
                  props.entry.visibleCategories,
                ).map((category, i) => (
                  <div
                    key={`category-${i}`}
                    className="ml-2 pl-1 pr-1 rounded text-white bg-gray-400"
                  >
                    #{category}
                  </div>
                ))}
              </div>
            </small>
        </div>

        <ReactMarkdown
          remarkPlugins={[remarkUnwrapImages]}
          rehypePlugins={[rehypeRaw]}
          disallowedElements={['figure']}
          components={{
            img({node}) {
                const alt = (node?.properties?.alt ?? '') as string;
                const classNames = ((node?.properties?.className ?? []) as string[]).join(' ');
                const path = (node?.properties?.src ?? '') as string;
                return Image({
                  imagePath: path,
                  imageSize: 'large',
                  className: classNames,
                  alt: alt,
                  showCaption: true,
                });
            },
            p({ children}) {
              if (Array.isArray(children) && children.filter((child) => child.props?.node?.tagName === 'img').length > 0) {

                return (<>{children.map((child) => {
                  if (child.props?.node?.tagName === 'img') {
                    return <>{child}</>;
                  }
                  // eslint-disable-next-line react/jsx-key
                  return <p>{child}</p>;
                })}</>);
              }
              const c = children as ReactElement;
              return c.props?.node?.tagName === 'img' ? (<>{children}</>) : (<p>{children}</p>);
            },
            code({className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '')
              const innerElement = String(children).replace(/\n$/, '')
              const styles = { background: "inherit", margin: "0px" }

              return match ? (
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
  </>;
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
