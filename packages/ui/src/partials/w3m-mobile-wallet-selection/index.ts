import { ConfigCtrl, RouterCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { TemplateUtil } from '../../utils/TemplateUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-mobile-wallet-selection')
export class W3mMobileWalletSelection extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private onQrcode() {
    RouterCtrl.push('Qrcode')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { explorerExcludedWalletIds, enableExplorer } = ConfigCtrl.state
    const isExplorerWallets = explorerExcludedWalletIds !== 'ALL' && enableExplorer
    const manualTemplate = TemplateUtil.manualWalletsTemplate()
    const recomendedTemplate = TemplateUtil.recomendedWalletsTemplate()
    const externalTemplate = TemplateUtil.externalWalletsTemplate()
    const recentTemplate = TemplateUtil.recentWalletTemplate()
    const injectedWallets = TemplateUtil.installedInjectedWalletsTemplate()

    let templates = [
      ...injectedWallets,
      recentTemplate,
      ...externalTemplate,
      ...manualTemplate,
      ...recomendedTemplate
    ]

    templates = templates.filter(Boolean)

    const isViewAll = templates.length > 8 || isExplorerWallets
    let wallets = []
    if (isViewAll) {
      wallets = templates.slice(0, 7)
    } else {
      wallets = templates
    }

    const isWallets = Boolean(wallets.length)

    return html`
      <w3m-modal-header
        title="Connect your wallet"
        .onAction=${this.onQrcode}
        .actionIcon=${SvgUtil.QRCODE_ICON}
        data-testid="partial-mobile-wallet-selection-header"
      ></w3m-modal-header>

      ${isWallets
        ? html`
            <w3m-modal-content data-testid="partial-mobile-wallet-selection-content">
              <div>
                ${wallets}
                ${isViewAll
                  ? html`<w3m-view-all-wallets-button></w3m-view-all-wallets-button>`
                  : null}
              </div>
            </w3m-modal-content>
          `
        : null}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-mobile-wallet-selection': W3mMobileWalletSelection
  }
}
