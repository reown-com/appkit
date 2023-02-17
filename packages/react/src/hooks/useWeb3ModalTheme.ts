import { ThemeCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'

export function useWeb3ModalTheme() {
  const [config, setConfig] = useState({
    themeMode: ThemeCtrl.state.themeMode,
    themeColor: ThemeCtrl.state.themeColor,
    themeBackground: ThemeCtrl.state.themeBackground
  })

  useEffect(() => {
    const unsubscribe = ThemeCtrl.subscribe(newTheme =>
      setConfig({
        themeMode: newTheme.themeMode,
        themeColor: newTheme.themeColor,
        themeBackground: newTheme.themeBackground
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
