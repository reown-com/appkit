'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function RandomLink({ hrefs, children }: { hrefs: string[]; children: React.ReactNode }) {
  const [href, setHref] = useState<string>()
  useEffect(() => {
    setHref(hrefs[Math.floor(Math.random() * hrefs.length)])
  }, [hrefs])

  return href ? <Link href={href}>{children}</Link> : <></>
}
