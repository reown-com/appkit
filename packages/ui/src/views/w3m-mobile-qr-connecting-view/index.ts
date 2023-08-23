import { CoreUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-mobile-qr-connecting-view')
export class W3mMobileQrConnectingView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- render ------------------------------------------------------- //
  protected render() {
    const { name, id, image_id } = CoreUtil.getWalletRouterData()
    const { isInjected, isDesktop, isWeb } = UiUtil.getCachedRouterWalletPlatforms()

    return html`
      <w3m-modal-header
        title=${name}
        .onAction=${UiUtil.handleUriCopy}
        .actionIcon=${SvgUtil.COPY_ICON}
        data-testid="view-mobile-qr-connecting-header"
      ></w3m-modal-header>

      <w3m-modal-content data-testid="view-mobile-qr-connecting-content">
        <w3m-walletconnect-qr walletId=${id} imageId=${image_id}></w3m-walletconnect-qr>
      </w3m-modal-content>

      <w3m-info-footer data-testid="view-mobile-qr-connecting-footer">
        <w3m-text color="secondary" variant="small-thin">
          ${`Scan this QR Code with your phone's camera or inside ${name} app`}
        </w3m-text>

        <w3m-platform-selection .isDesktop=${isDesktop} .isInjected=${isInjected} .isWeb=${isWeb}>
        </w3m-platform-selection>
      </w3m-info-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-mobile-qr-connecting-view': W3mMobileQrConnectingView
  }
}
