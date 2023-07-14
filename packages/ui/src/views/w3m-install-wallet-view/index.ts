import { CoreUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-install-wallet-view')
export class W3mInstallWalletView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //

  private onInstall(uri?: string) {
    if (uri) {
      CoreUtil.openHref(uri, '_blank')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { name, id, image_id, homepage } = CoreUtil.getWalletRouterData()

    return html`
      <w3m-modal-header title=${name} data-testid="view-install-wallet-header"></w3m-modal-header>

      <w3m-modal-content data-testid="view-install-wallet-content">
        <w3m-connector-waiting
          walletId=${id}
          imageId=${image_id}
          label="Not Detected"
          .isStale=${true}
        ></w3m-connector-waiting>
      </w3m-modal-content>

      <w3m-info-footer data-testid="view-install-wallet-footer">
        <w3m-text color="secondary" variant="small-thin">
          ${`Download ${name} to continue. If multiple browser extensions are installed, disable non ${name} ones and try again`}
        </w3m-text>

        <w3m-button
          .onClick=${() => this.onInstall(homepage)}
          .iconLeft=${SvgUtil.ARROW_DOWN_ICON}
          data-testid="view-install-wallet-download-button"
        >
          Download
        </w3m-button>
      </w3m-info-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-install-wallet-view': W3mInstallWalletView
  }
}
