import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { type CaipNetwork } from '@reown/appkit-common'
import { AssetUtil, RouterController } from '@reown/appkit-controllers'
import { UiHelperUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-content'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-wallet-send-details')
export class W3mWalletSendDetails extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  @property() public receiverAddress?: string

  @property({ type: Object }) public caipNetwork?: CaipNetwork

  @state() private params = RouterController.state.data?.send

  // -- Render -------------------------------------------- //
  public override render() {
    return html` <wui-text variant="sm-regular" color="secondary">Details</wui-text>
      <wui-flex flexDirection="column" gap="1">
        <wui-list-content
          textTitle="Address"
          textValue=${UiHelperUtil.getTruncateString({
            string: this.receiverAddress ?? '',
            charsStart: 4,
            charsEnd: 4,
            truncate: 'middle'
          })}
        >
        </wui-list-content>
        ${this.networkTemplate()}
      </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private networkTemplate() {
    if (this.caipNetwork?.name) {
      return html` <wui-list-content
        @click=${() => this.onNetworkClick(this.caipNetwork)}
        class="network"
        textTitle="Network"
        imageSrc=${ifDefined(AssetUtil.getNetworkImage(this.caipNetwork))}
      ></wui-list-content>`
    }

    return null
  }

  private onNetworkClick(network?: CaipNetwork) {
    if (network && !this.params) {
      RouterController.push('Networks', { network })
    }
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-send-details': W3mWalletSendDetails
  }
}
