'use client'

import { useEffect, useState } from 'react'

import { Link } from '@chakra-ui/react'

export function RandomLink({
  hrefs = [],
  children
}: {
  hrefs: string[]
  children: React.ReactNode
}) {
  const [href, setHref] = useState<string>()
  useEffect(() => {
    const newHref = hrefs[Math.floor(Math.random() * hrefs.length)]
    if (newHref) {
      setHref(newHref)
    }
  }, [hrefs])

  return href ? <Link href={href}>{children}</Link> : <></>
}
