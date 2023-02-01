import { createTheme, NextUIProvider, Text } from '@nextui-org/react'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <>
      {ready ? (
        <NextUIProvider theme={createTheme({ type: 'dark' })}>
          <Text h1 color="success" css={{ width: '100%', textAlign: 'center', paddingTop: '$10' }}>
            Web3Modal Lab 🧪
          </Text>
          <Component {...pageProps} />
        </NextUIProvider>
      ) : null}
    </>
  )
}
