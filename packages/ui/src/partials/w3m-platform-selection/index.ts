import { CoreUtil, RouterCtrl } from '@web3modal/core'
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
    const isMobile = CoreUtil.isMobile()
    if (isMobile) {
      RouterCtrl.push('MobileConnecting')
    } else {
      RouterCtrl.push('MobileQrcodeConnecting')
    }
  }

  private onInjected() {
    RouterCtrl.push('InjectedConnecting')
  }

  private onDesktop() {
    RouterCtrl.push('DesktopConnecting')
  }

  private onWeb() {
    RouterCtrl.push('WebConnecting')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div>
        <slot></slot>
        ${this.isMobile
          ? html`<w3m-button
              .onClick=${this.onMobile}
              .iconLeft=${SvgUtil.MOBILE_ICON}
              variant="outline"
            >
              Mobile
            </w3m-button>`
          : null}
        ${this.isInjected
          ? html`<w3m-button
              .onClick=${this.onInjected}
              .iconLeft=${SvgUtil.WALLET_ICON}
              variant="outline"
            >
              Browser
            </w3m-button>`
          : null}
        ${this.isDesktop
          ? html`<w3m-button
              .onClick=${this.onDesktop}
              .iconLeft=${SvgUtil.DESKTOP_ICON}
              variant="outline"
            >
              Desktop
            </w3m-button>`
          : null}
        ${this.isWeb
          ? html`<w3m-button
              .onClick=${this.onWeb}
              .iconLeft=${SvgUtil.MOBILE_ICON}
              variant="outline"
            >
              Web
            </w3m-button>`
          : null}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-platform-selection': W3mPlatformSelection
  }
}
