import { UiHelperUtil, customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { property } from 'lit/decorators.js'

@customElement('w3m-wallet-send-details')
export class W3mWalletSendDetails extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  @property() public receiverAddress?: string

  // -- Render -------------------------------------------- //
  public override render() {
    return html` <wui-text variant="small-400" color="fg-200">Details</wui-text>
      <wui-flex flexDirection="column" gap="xxs">
        <wui-list-content textTitle="Network cost" textValue="$3.20"></wui-list-content>
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
      </wui-flex>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-send-details': W3mWalletSendDetails
  }
}
