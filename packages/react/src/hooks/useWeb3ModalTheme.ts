import { ThemeCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'

export function useWeb3ModalTheme() {
  const [config, setConfig] = useState({
    themeMode: ThemeCtrl.state.themeMode
  })

  useEffect(() => {
    const unsubscribe = ThemeCtrl.subscribe(newTheme =>
      setConfig({
        themeMode: newTheme.themeMode
      })
    )

    return () => {
      unsubscribe()
    }
  }, [])

  return {
    theme: config,
    setTheme: ThemeCtrl.setThemeConfig
  }
}
