import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { CoreHelperUtil, SendController, RouterController } from '@web3modal/core'

import { state } from 'lit/decorators.js'

@customElement('w3m-wallet-select-send-view')
export class W3mWalletSelectSend extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private receiverAddress = SendController.state.receiverAddress

  @state() private receiverProfileName = SendController.state.receiverProfileName

  @state() private message: 'Generate link' | 'Invalid Address' | 'Send' = 'Generate link'

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        SendController.subscribe(val => {
          this.receiverAddress = val.receiverAddress
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }
  // -- Render -------------------------------------------- //
  public override render() {
    this.getMessage()

    return html` <wui-flex
      flexDirection="column"
      gap="s"
      .padding=${['s', 'l', 'l', 'l'] as const}
    >
       <w3m-input-address
          .value=${this.receiverProfileName ? this.receiverProfileName : this.receiverAddress}
        ></w3m-input-address>
      <wui-flex justifyContent="center" alignItems="center" gap="1">
        <wui-separator></wui-separator>
        or
        <wui-separator></wui-separator>
      </wui-flex>

      <wui-flex .margin=${['0', '0', '0', '0'] as const}>

        <wui-button
        @click=${this.onButtonClick.bind(this)}
        ?disabled=${!this.message.startsWith('Generate link') && !this.message.startsWith('Send')}
        size="lg"
          variant="main"
          fullWidth
        >
          ${this.message}
        </wui-button>
      </wui-flex>
    </wui-flex>`
  } // TODO: icon color is different from button text color

  // -- Private ------------------------------------------- //
  private onButtonClick() {
    if (this.message == 'Generate link') {
      SendController.setType('Link')
    } else if (this.message == 'Send') {
      SendController.setType('Address')
    }
    RouterController.push('WalletSend')
  }

  private getMessage() {
    this.message = 'Generate link'

    if (this.receiverAddress && !CoreHelperUtil.isAddress(this.receiverAddress)) {
      this.message = 'Invalid Address'
    }

    if (this.receiverAddress && CoreHelperUtil.isAddress(this.receiverAddress)) {
      this.message = 'Send'
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-select-send-view': W3mWalletSelectSend
  }
}
