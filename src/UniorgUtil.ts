import type { Parser } from 'unified';
import type { OrgNode } from 'uniorg';
import { ParseOptions } from 'uniorg-parse/lib/parse-options';
import { parse } from 'uniorg-parse/lib/parser';

const options: ParseOptions = {
  todoKeywords: ['TODO', 'DONE'],
  useSubSuperscripts: '{}',
  // Interestingly enough, zero-width space (\u200b) is not considered
  // a space in unicode but is considered a space by Emacs. This is
  // why we have to add \u200b explicitly after \s in the
  // regex. Otherwise, the suggested use-case of adding ZWSP as a
  // markup border does not work.
  emphasisRegexpComponents: {
    // deviates from org mode default to allow ndash, mdash, and
    // quotes (’“”)
    pre: '-–—\\s\u200b\\(\'’"“”\\{',
    // deviates from org mode default to allow ndash, mdash, and
    // quotes (’“”)
    post: '-–—\\s\u200b.,:!?;\'’"“”\\)\\}\\[',
    border: '\\s\u200b',
    body: '.',
    newline: 1,
  },
  linkTypes: ['https', 'http'],
  matchSexpDepth: 3,
};

export function orgParse(this: any) {
  const parser: Parser<OrgNode> = (_doc, file) => parse(file, options);
  Object.assign(this, { Parser: parser });
}
