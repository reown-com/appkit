import { LitElement, html } from 'lit'

import { ConstantsUtil } from '@laughingwhales/appkit-controllers'
import { customElement } from '@laughingwhales/appkit-ui'
import '@laughingwhales/appkit-ui/wui-flex'
import '@laughingwhales/appkit-ui/wui-semantic-chip'
import '@laughingwhales/appkit-ui/wui-text'

@customElement('w3m-upgrade-wallet-view')
export class W3mUpgradeWalletView extends LitElement {
  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" alignItems="center" gap="5" padding="5">
        <wui-text variant="md-regular" color="primary">Follow the instructions on</wui-text>
        <wui-semantic-chip
          icon="externalLink"
          variant="fill"
          text=${ConstantsUtil.SECURE_SITE_DASHBOARD}
          href=${ConstantsUtil.SECURE_SITE_DASHBOARD}
          imageSrc=${ConstantsUtil.SECURE_SITE_FAVICON}
          data-testid="w3m-secure-website-button"
        >
        </wui-semantic-chip>
        <wui-text variant="sm-regular" color="secondary">
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
