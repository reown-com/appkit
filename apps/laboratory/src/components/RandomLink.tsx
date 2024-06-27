"use client";

import Link from "next/link";

export function RandomLink({ hrefs, children }: { hrefs: string[], children: React.ReactNode }) {
  const href = hrefs[Math.floor(Math.random() * hrefs.length)];
  if (!href) throw new Error("No hrefs provided");
  return <Link href={href}>
    {children}
  </Link>
}
