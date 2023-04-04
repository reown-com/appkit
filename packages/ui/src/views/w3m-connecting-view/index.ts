import { CoreUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { DataUtil } from '../../utils/DataUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'

@customElement('w3m-connecting-view')
export class W3mConnectingView extends LitElement {
  public static styles = [ThemeUtil.globalCss]

  // -- private ------------------------------------------------------ //
  private getSupportedPlatfroms() {
    const { id, desktop, mobile } = CoreUtil.getConnectingRouterData()
    const injectedWallets = DataUtil.injectedWallets()
    const isInjected = injectedWallets.some(wallet => wallet.id === id)
    const isDesktop = Boolean(desktop?.native ?? desktop?.universal)
    const isMobile = Boolean(mobile?.native ?? mobile?.universal)

    return { isInjected, isDesktop, isMobile }
  }

  private desktopTemplate() {
    const { isInjected, isDesktop, isMobile } = this.getSupportedPlatfroms()

    if (isInjected) {
      return html`<w3m-injected-connecting></w3m-injected-connecting>`
    } else if (isDesktop) {
      return html`<w3m-desktop-connecting></w3m-desktop-connecting>`
    } else if (isMobile) {
      return html`todo`
    }

    return html`<w3m-install-wallet></w3m-install-wallet>`
  }

  private mobileTemplate() {
    // 1. Check if has mobile wallet
    // 2. Check if has web wallet
    // 3. Fallback to install page

    return null
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const routerData = CoreUtil.getConnectingRouterData()
    const { name } = routerData
    const isMobile = CoreUtil.isMobile()

    return html`
      <w3m-modal-header title=${name}></w3m-modal-header>
      ${isMobile ? this.mobileTemplate() : this.desktopTemplate()}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-view': W3mConnectingView
  }
}
