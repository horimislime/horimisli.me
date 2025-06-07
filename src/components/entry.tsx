import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

import { Entry } from '../entities/Entry';
import Date from './date';

import type { JSX } from "react";

export default function EntryList(params: { entries: Entry[] }): JSX.Element {
  return (
    <ul className="list-none m-4">
      {params.entries.map(
        ({ id, date, title, visibleCategories, type, externalURL }) => (
          <li key={id}>
            <small className="text-sm flex">
              <Date dateString={date} />
              <div className="flex ml-2">
                {Array.from(
                  visibleCategories,
                ).map((category, i) => (
                  <div
                    key={`${id}-category-${i}`}
                    className="ml-2 pl-1 pr-1 rounded text-white bg-gray-400"
                  >
                    #{category}
                  </div>
                ))}
              </div>
            </small>
            {type === 'normal' ? (
              <Link href={`/entry/${id}`} className="underline font-medium">
                {title}
              </Link>
            ) : (
              <a
                className="underline font-medium"
                href={externalURL}
                target="_blank"
                rel="noreferrer"
              >
                [{type}] {title}{' '}
                <FontAwesomeIcon
                  icon={faExternalLinkAlt}
                  className="w-4 mr-2 mb-1 inline"
                />
              </a>
            )}
          </li>
        ),
      )}
    </ul>
  );
}
