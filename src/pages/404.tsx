import Link from "next/link";

import type { JSX } from "react";

export default function NotFound(): JSX.Element {
  return (
    <main className="prose m-4">
      <h1>404 - Page Not Found</h1>
      <Link href="/">Back to Home</Link>
    </main>
  );
}
