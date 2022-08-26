import { ConfigCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { color } from './Theme'

type ThemeType = typeof ConfigCtrl['state']['theme']

export default class ThemedElement extends LitElement {
  private readonly configUnsub?: () => void = undefined
  @state() public theme = 'light'

  protected dynamicStyles() {
    const { foreground, background, overlay } = color()

    return html`
      <style>
        button {
          color: ${foreground.inverse};
          background-color: ${foreground.accent};
          box-shadow: inset 0 0 0 1px ${overlay.thin};
        }

        button::before {
          background-color: ${overlay.thin};
        }

        .w3m-button-loading:disabled {
          background-color: ${background.accent};
        }

        button:disabled {
          background-color: ${background[3]};
          color: ${foreground[3]};
        }

        svg path {
          fill: ${foreground.inverse};
        }

        button:disabled svg path {
          fill: ${foreground[3]};
        }
      </style>
    `
  }

  public disconnectedCallback() {
    this.configUnsub?.()
  }

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()

    this.configUnsub = ConfigCtrl.subscribe(configState => {
      this.theme = configState.theme ?? 'dark'
    })

    if (typeof window !== 'undefined') {
      const prefersDarkModePreference = window.matchMedia('(prefers-color-scheme: dark)')
      const initialTheme: ThemeType = prefersDarkModePreference.matches ? 'dark' : 'light'
      ConfigCtrl.setConfig({ theme: initialTheme, projectId: ConfigCtrl.state.projectId })

      prefersDarkModePreference.addEventListener('change', ({ matches: prefersDarkMode }) => {
        const theme: ThemeType = prefersDarkMode ? 'dark' : 'light'
        ConfigCtrl.setConfig({ theme, projectId: ConfigCtrl.state.projectId })
      })
    }
  }
}
