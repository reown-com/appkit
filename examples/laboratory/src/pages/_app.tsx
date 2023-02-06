import { createTheme, Link, NextUIProvider, Text } from '@nextui-org/react'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { bootstrap as bootstrapSentry } from '../utilities/SentryUtil'

bootstrapSentry()

export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <>
      {ready ? (
        <NextUIProvider theme={createTheme({ type: 'dark' })}>
          <Link href="/" css={{ margin: '30px auto 0', display: 'block' }}>
            <Text h1 color="success">
              Web3Modal Lab 🧪
            </Text>
          </Link>

          <Component {...pageProps} />
        </NextUIProvider>
      ) : null}
    </>
  )
}
