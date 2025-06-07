import type { JSX } from "react";
export default function TweetButton(params: {
  title: string;
  path: string;
}): JSX.Element {
  const text = `${params.title} / https://${process.env.NEXT_PUBLIC_SITE_DOMAIN}${params.path}`;
  return (
    <a
      className="bg-blue-400 p-2 rounded-md text-white"
      href={`https://twitter.com/intent/tweet?text=${text}`}
      target="_blank"
      rel="noreferrer"
    >
      Tweet
    </a>
  );
}
