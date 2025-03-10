import { LitElement, html } from 'lit'

import { ConstantsUtil } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-chip'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'

@customElement('w3m-upgrade-wallet-view')
export class W3mUpgradeWalletView extends LitElement {
  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" alignItems="center" gap="xl" padding="xl">
        <wui-text variant="paragraph-400" color="fg-100">Follow the instructions on</wui-text>
        <wui-chip
          icon="externalLink"
          variant="fill"
          href=${ConstantsUtil.SECURE_SITE_DASHBOARD}
          imageSrc=${ConstantsUtil.SECURE_SITE_FAVICON}
          data-testid="w3m-secure-website-button"
        >
        </wui-chip>
        <wui-text variant="small-400" color="fg-200">
          You will have to reconnect for security reasons
        </wui-text>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-upgrade-wallet-view': W3mUpgradeWalletView
  }
}
