import { CoreUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-connecting-view')
export class W3mConnectingView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //

  private desktopTemplate() {
    const { isInjected, isInjectedInstalled, isDesktop, isMobile, isWeb } =
      UiUtil.getCachedRouterWalletPlatforms()

    if (isInjectedInstalled) {
      return html`<w3m-injected-connecting></w3m-injected-connecting>`
    } else if (isDesktop) {
      return html`<w3m-desktop-connecting></w3m-desktop-connecting>`
    } else if (isWeb) {
      // TODO: New web wallet view
      return html`TODO WEB`
    } else if (!isMobile) {
      // TODO: New desktop mobile view
      return html`TODO MOBILE`
    } else if (isInjected) {
      return html`<w3m-injected-connecting></w3m-injected-connecting>`
    }

    // TODO: New design for this case
    return html`<w3m-install-wallet></w3m-install-wallet>`
  }

  private mobileTemplate() {
    const { isMobile, isWeb } = UiUtil.getCachedRouterWalletPlatforms()

    if (isMobile) {
      return html`<w3m-mobile-connecting></w3m-mobile-connecting>`
    } else if (isWeb) {
      // TODO: New web wallet view
      return html`TODO`
    }

    // TODO: New design for this case
    return html`<w3m-install-wallet></w3m-install-wallet>`
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const isMobile = CoreUtil.isMobile()

    return html` ${isMobile ? this.mobileTemplate() : this.desktopTemplate()} `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-view': W3mConnectingView
  }
}
