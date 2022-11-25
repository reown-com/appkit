/* eslint-disable @typescript-eslint/no-explicit-any */
import { useWeb3ModalTheme } from '@web3modal/react'

export default function ThemeControls() {
  const { setTheme } = useWeb3ModalTheme()

  function setColor(event: any) {
    if (event?.target?.value?.length) {
      setTheme({ themeColor: event.target.value })
    }
  }

  function setMode(event: any) {
    if (event?.target?.value?.length) {
      setTheme({ themeMode: event.target.value })
    }
  }

  function setBackground(event: any) {
    if (event?.target?.value?.length) {
      setTheme({ themeBackground: event.target.value })
    }
  }

  return (
    <>
      <h2>Theming</h2>

      <div className="container">
        <select onChange={setColor}>
          <option value="">--Select theme color--</option>
          <option value="default">default</option>
          <option value="blackWhite">blackWhite</option>
          <option value="blue">blue</option>
          <option value="green">green</option>
          <option value="magenta">magenta</option>
          <option value="orange">orange</option>
          <option value="purple">purple</option>
          <option value="teal">teal</option>
        </select>

        <select onChange={setMode}>
          <option value="">--Select theme mode--</option>
          <option value="light">light</option>
          <option value="dark">dark</option>
        </select>

        <select onChange={setBackground}>
          <option value="">--Select theme background--</option>
          <option value="gradient">gradient</option>
          <option value="themeColor">themeColor</option>
        </select>
      </div>
    </>
  )
}
