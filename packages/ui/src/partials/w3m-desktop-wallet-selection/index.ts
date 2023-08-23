import { ConfigCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { TemplateUtil } from '../../utils/TemplateUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-desktop-wallet-selection')
export class W3mDesktopWalletSelection extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

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

    const isViewAll = templates.length > 4 || isExplorerWallets
    let wallets = []
    if (isViewAll) {
      wallets = templates.slice(0, 3)
    } else {
      wallets = templates
    }
    const isWallets = Boolean(wallets.length)

    return html`
      <w3m-modal-header
        .border=${true}
        title="Connect your wallet"
        .onAction=${UiUtil.handleUriCopy}
        .actionIcon=${SvgUtil.COPY_ICON}
        data-testid="partial-desktop-wallet-selection-header"
      ></w3m-modal-header>

      <w3m-modal-content data-testid="partial-desktop-wallet-selection-content">
        <div class="w3m-mobile-title">
          <div class="w3m-subtitle">
            ${SvgUtil.MOBILE_ICON}
            <w3m-text variant="small-regular" color="accent">Mobile</w3m-text>
          </div>

          <div class="w3m-subtitle">
            ${SvgUtil.SCAN_ICON}
            <w3m-text variant="small-regular" color="secondary">Scan with your wallet</w3m-text>
          </div>
        </div>
        <w3m-walletconnect-qr></w3m-walletconnect-qr>
      </w3m-modal-content>

      ${isWallets
        ? html`
            <w3m-modal-footer data-testid="partial-desktop-wallet-selection-footer">
              <div class="w3m-desktop-title">
                ${SvgUtil.DESKTOP_ICON}
                <w3m-text variant="small-regular" color="accent">Desktop</w3m-text>
              </div>

              <div class="w3m-grid">
                ${wallets}
                ${isViewAll
                  ? html`<w3m-view-all-wallets-button></w3m-view-all-wallets-button>`
                  : null}
              </div>
            </w3m-modal-footer>
          `
        : null}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-desktop-wallet-selection': W3mDesktopWalletSelection
  }
}
