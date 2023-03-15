import { ThemeCtrl } from '@web3modal/core'
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ThemeUtil } from '../utils/ThemeUtil'
import { UiUtil } from '../utils/UiUtil'

@customElement('w3m-theme-context')
export class W3mThemeContext extends LitElement {
  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()

    // Set & Subscribe to theme state
    ThemeUtil.setTheme()
    this.unsubscribeTheme = ThemeCtrl.subscribe(ThemeUtil.setTheme)
    this.preloadThemeImages()
  }

  public disconnectedCallback() {
    this.unsubscribeTheme?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeTheme?: () => void = undefined

  private async preloadThemeImages() {
    try {
      const { themeVariables } = ThemeCtrl.state
      const images = [
        themeVariables?.['--w3m-background-image-url'],
        themeVariables?.['--w3m-logo-image-url']
      ].filter(Boolean) as string[]
      if (images.length) {
        await Promise.all(images.map(async url => UiUtil.preloadImage(url)))
      }
    } catch {
      console.info('Unsuccessful attempt at preloading some images')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-theme-context': W3mThemeContext
  }
}
