import { ThemeCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'

export function useWeb3ModalTheme() {
  const [config, setConfig] = useState({
    themeMode: ThemeCtrl.state.themeMode,
    themeVariables: ThemeCtrl.state.themeVariables
  })

  useEffect(() => {
    const unsubscribe = ThemeCtrl.subscribe(newTheme =>
      setConfig({
        themeMode: newTheme.themeMode,
        themeVariables: newTheme.themeVariables
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
