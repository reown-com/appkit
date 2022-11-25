/* eslint-disable @typescript-eslint/no-explicit-any */
import { useWeb3ModalTheme } from '@web3modal/react'

export default function ThemeControls() {
  const { theme, setTheme } = useWeb3ModalTheme()

  return (
    <>
      <h2>Theming</h2>

      <div className="container">
        <select
          value={theme.themeColor}
          onChange={({ target }) => setTheme({ themeColor: target.value as any })}
        >
          <option value="default">default</option>
          <option value="blackWhite">blackWhite</option>
          <option value="blue">blue</option>
          <option value="green">green</option>
          <option value="magenta">magenta</option>
          <option value="orange">orange</option>
          <option value="purple">purple</option>
          <option value="teal">teal</option>
        </select>

        <select
          value={theme.themeMode}
          onChange={({ target }) => setTheme({ themeMode: target.value as any })}
        >
          <option value="light">light</option>
          <option value="dark">dark</option>
        </select>

        <select
          value={theme.themeBackground}
          onChange={({ target }) => setTheme({ themeBackground: target.value as any })}
        >
          <option value="gradient">gradient</option>
          <option value="themeColor">themeColor</option>
        </select>
      </div>
    </>
  )
}
