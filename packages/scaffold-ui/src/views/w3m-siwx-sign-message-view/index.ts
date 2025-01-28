import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { OptionsController, SIWXUtil } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'

import '../../partials/w3m-siwx-sign-message-thumbnails/index.js'

@customElement('w3m-siwx-sign-message-view')
export class W3mSIWXSignMessageView extends LitElement {
  // -- Members ------------------------------------------- //
  private readonly dappName = OptionsController.state.metadata?.name

  @state() private isCancelling = false

  @state() private isSigning = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex justifyContent="center" .padding=${['2xl', '0', 'xxl', '0'] as const}>
        <w3m-siwx-sign-message-thumbnails></w3m-siwx-sign-message-thumbnails>
      </wui-flex>
      <wui-flex
        .padding=${['0', '4xl', 'l', '4xl'] as const}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="paragraph-500" align="center" color="fg-100"
          >${this.dappName ?? 'Dapp'} needs to connect to your wallet</wui-text
        >
      </wui-flex>
      <wui-flex
        .padding=${['0', '3xl', 'l', '3xl'] as const}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="small-400" align="center" color="fg-200"
          >Sign this message to prove you own this wallet and proceed. Canceling will disconnect
          you.</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${['l', 'xl', 'xl', 'xl'] as const} gap="s" justifyContent="space-between">
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral"
          ?loading=${this.isCancelling}
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          ${this.isCancelling ? 'Cancelling...' : 'Cancel'}
        </wui-button>
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="main"
          @click=${this.onSign.bind(this)}
          ?loading=${this.isSigning}
          data-testid="w3m-connecting-siwe-sign"
        >
          ${this.isSigning ? 'Signing...' : 'Sign'}
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private async onSign() {
    this.isSigning = true
    await SIWXUtil.requestSignMessage().finally(() => (this.isSigning = false))
  }

  private async onCancel() {
    this.isCancelling = true
    await SIWXUtil.cancelSignMessage().finally(() => (this.isCancelling = false))
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-siwx-sign-message-view': W3mSIWXSignMessageView
  }
}
