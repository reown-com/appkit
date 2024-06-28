'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function RandomLink({ hrefs, children }: { hrefs: string[]; children: React.ReactNode }) {
  const [href, setHref] = useState<string>()
  useEffect(() => {
    const href = hrefs[Math.floor(Math.random() * hrefs.length)]
    if (!href) {
      throw new Error('No hrefs provided')
    }
    setHref(href)
  }, [hrefs])

  return href ? <Link href={href}>{children}</Link> : <></>
}
