import { ConfigCtrl } from '@web3modal/core'
import { useEffect, useState } from 'react'

export function useWeb3ModalTheme() {
  const [config, setConfig] = useState({
    themeMode: ConfigCtrl.state.themeMode,
    themeColor: ConfigCtrl.state.themeColor,
    themeBackground: ConfigCtrl.state.themeBackground
  })

  useEffect(() => {
    const unsubscribe = ConfigCtrl.subscribe(newTheme =>
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
    setTheme: ConfigCtrl.setThemeConfig
  }
}
