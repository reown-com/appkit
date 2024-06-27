"use client";

import Link from "next/link";

export function RandomLink({ hrefs, children }: { hrefs: string[], children: React.ReactNode }) {
  const href = hrefs[Math.floor(Math.random() * hrefs.length)]!;
  return <Link href={href}>
    {children}
  </Link>
}
