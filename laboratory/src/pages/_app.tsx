import { createTheme, Link, NextUIProvider, Row, Switch, Text } from '@nextui-org/react'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { MoonIcon } from '../components/MoonIcon'
import { SunIcon } from '../components/SunIcon'
import { getTheme } from '../utilities/EnvUtil'
import { bootstrap as bootstrapSentry } from '../utilities/SentryUtil'

bootstrapSentry()

export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false)
  const [dark, setDark] = useState(true)

  function toggleTheme() {
    setDark(prev => {
      localStorage.setItem('THEME', prev ? 'light' : 'dark')

      return !prev
    })
  }

  useEffect(() => {
    setDark(getTheme() === 'dark')
    setReady(true)
  }, [])

  return (
    <>
      {ready ? (
        <NextUIProvider theme={createTheme({ type: dark ? 'dark' : 'light' })}>
          <Link href="/" css={{ margin: '30px auto 0', display: 'block' }}>
            <Text h1 color="success">
              Web3Modal Lab 🧪
            </Text>
          </Link>

          <Row justify="center">
            <Switch
              size="xl"
              iconOff={<MoonIcon />}
              iconOn={<SunIcon />}
              onChange={toggleTheme}
              checked={!dark}
            />
          </Row>

          <Component {...pageProps} />
        </NextUIProvider>
      ) : null}
    </>
  )
}
