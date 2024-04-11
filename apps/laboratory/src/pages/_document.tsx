import { Html, Head, Main, NextScript } from 'next/document'
import { cn } from '@/lib/utils'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className={cn('selection:bg-foreground/10')}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
