import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-platform-selection')
export class W3mPlatformSelection extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public isMobile = false
  @property() public isInjected = false
  @property() public isDesktop = false
  @property() public isWeb = false

  // -- private ------------------------------------------------------ //
  private onMobile() {
    // TODO go to mobile desktop view
  }

  private onInjected() {
    // TODO go to mobile desktop view
  }

  private onDesktop() {
    // TODO go to mobile desktop view
  }

  private onWeb() {
    // TODO go to mobile desktop view
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${this.isMobile
        ? html`<w3m-button .onClick=${this.onMobile} .iconLeft=${SvgUtil.MOBILE_ICON}>
            Mobile
          </w3m-button>`
        : null}
      ${this.isInjected
        ? html`<w3m-button .onClick=${this.onInjected} .iconLeft=${SvgUtil.WALLET_ICON}>
            Browser
          </w3m-button>`
        : null}
      ${this.isDesktop
        ? html`<w3m-button .onClick=${this.onDesktop} .iconLeft=${SvgUtil.DESKTOP_ICON}>
            Desktop
          </w3m-button>`
        : null}
      ${this.isWeb
        ? html`<w3m-button .onClick=${this.onWeb} .iconLeft=${SvgUtil.MOBILE_ICON}>
            Web
          </w3m-button>`
        : null}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-platform-selection': W3mPlatformSelection
  }
}
