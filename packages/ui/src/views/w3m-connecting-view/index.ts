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
      // TODO: New desktop mobile view
      return html`TODO`
    }

    // TODO: New design for this case
    return html`<w3m-install-wallet></w3m-install-wallet>`
  }

  private mobileTemplate() {
    const { isMobile } = this.getSupportedPlatfroms()

    if (isMobile) {
      return html`<w3m-mobile-connecting></w3m-mobile-connecting>`
    }

    // TODO: Web wallet handling

    // TODO: New design for this case
    return html`<w3m-install-wallet></w3m-install-wallet>`
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
