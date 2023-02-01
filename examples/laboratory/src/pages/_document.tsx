import { CssBaseline } from '@nextui-org/react'
import type { DocumentContext } from 'next/document'
import { Head, Html, Main, NextScript } from 'next/document'
import { Children } from 'react'

export default function Document() {
  return (
    <Html>
      <Head>{CssBaseline.flush()}</Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

Document.getInitialProps = async (ctx: DocumentContext) => {
  const props = await ctx.defaultGetInitialProps(ctx)

  return {
    ...props,
    styles: Children.toArray([props.styles])
  }
}
