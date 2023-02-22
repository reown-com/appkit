import { ThemeCtrl } from '@web3modal/core'
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ThemeUtil } from '../utils/ThemeUtil'

@customElement('w3m-theme-context')
export class W3mThemeContext extends LitElement {
  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()

    // Set & Subscribe to theme state
    ThemeUtil.setTheme()
    this.unsubscribeTheme = ThemeCtrl.subscribe(ThemeUtil.setTheme)
  }

  public disconnectedCallback() {
    this.unsubscribeTheme?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeTheme?: () => void = undefined
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-theme-context': W3mThemeContext
  }
}
