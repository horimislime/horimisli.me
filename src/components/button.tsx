import Link from 'next/link';
import { toArray } from 'react-emoji-render';
const EmojiAliases = require('react-emoji-render/data/aliases');

const parseEmojis = (value: string) => {
  const emojisArray = toArray(value);
  const newValue = emojisArray.reduce((previous, current) => {
    if (typeof current === 'string') {
      return previous + current;
    }
    return previous + (current as React.ReactElement).props.children;
  }, '');

  return newValue;
};

const randomEmoji = (): string => {
  const emojiKeys = Object.keys(EmojiAliases);
  return `:${emojiKeys[Math.floor(Math.random() * emojiKeys.length)]}:`;
};

const HomeButton = (): JSX.Element => {
  const emoji = randomEmoji();
  const emojiString = parseEmojis(emoji);
  return (
    (<Link
      href="/"
      className="border-2 border-black border-solid px-2 py-1 font-extrabold hover:bg-black hover:text-white mr-auto">

      {emojiString} {process.env.NEXT_PUBLIC_SITE_NAME}

    </Link>)
  );
};

export default HomeButton;
