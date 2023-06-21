import { Link, NextUIProvider, Row, Switch, Text, createTheme } from '@nextui-org/react'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { ClearLocalStorageButton } from '../components/ClearLocalStorageButton'
import { MoonIcon } from '../components/MoonIcon'
import { NotificationModal } from '../components/NotificationModal'
import { ShowLocalStorageButton } from '../components/ShowLocalStorageButton'
import { SunIcon } from '../components/SunIcon'
import Toast from '../components/Toast'
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
            <Text h2 color="success">
              Web3Modal Lab
            </Text>
          </Link>

          <Row justify="center" align="center">
            <Switch
              size="xl"
              iconOff={<MoonIcon />}
              iconOn={<SunIcon />}
              onChange={toggleTheme}
              checked={!dark}
            />
            <div>
              <ShowLocalStorageButton />
              <ClearLocalStorageButton />
            </div>
          </Row>
          <NotificationModal />
          <Toast />

          <Component {...pageProps} />
        </NextUIProvider>
      ) : null}
    </>
  )
}
