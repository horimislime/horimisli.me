import { format, parseISO } from 'date-fns';

import type { JSX } from "react";

export default function Date(params: { dateString: string }): JSX.Element {
  const formattedDate = format(parseISO(params.dateString), 'yyyy/MM/dd');
  return <time>{formattedDate}</time>;
}
