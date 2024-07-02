'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function RandomLink({ hrefs, children }: { hrefs: string[]; children: React.ReactNode }) {
  const [href, setHref] = useState<string>()
  useEffect(() => {
    const newHref = hrefs[Math.floor(Math.random() * hrefs.length)]
    setHref(newHref)
  }, [hrefs])

  return href ? <Link href={href}>{children}</Link> : <></>
}
