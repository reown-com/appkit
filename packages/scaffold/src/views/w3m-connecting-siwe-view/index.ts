import {
  AccountController,
  OptionsController,
  RouterController,
  SIWEController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

@customElement('w3m-connecting-siwe-view')
export class W3mConnectingSiweView extends LitElement {
  // -- Members ------------------------------------------- //
  private readonly dappName = OptionsController.state.metadata?.name

  @state() private isSigning = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex justifyContent="center" .padding=${['2xl', '0', 'xxl', '0'] as const}>
        <w3m-connecting-siwe></w3m-connecting-siwe>
      </wui-flex>
      <wui-flex
        .padding=${['0', '4xl', 'l', '4xl'] as const}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="paragraph-500" align="center" color="fg-100"
          >${this.dappName ?? 'Dapp'} wants to connect to your wallet</wui-text
        >
      </wui-flex>
      <wui-flex
        .padding=${['0', '3xl', 'l', '3xl'] as const}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="small-400" align="center" color="fg-200"
          >Sign this message to prove you own this wallet and to continue</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${['l', 'xl', 'xl', 'xl'] as const} gap="s" justifyContent="space-between">
        <wui-button size="md" ?fullwidth=${true} variant="shade" @click=${this.onCancel.bind(this)}>
          Cancel
        </wui-button>
        <wui-button
          size="md"
          ?fullwidth=${true}
          variant="fill"
          @click=${this.onSign.bind(this)}
          ?loading=${this.isSigning}
        >
          ${this.isSigning ? 'Signing...' : 'Sign'}
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private async onSign() {
    this.isSigning = true
    try {
      SIWEController.setStatus('loading')
      const session = await SIWEController.signIn()
      SIWEController.setStatus('success')

      return session
    } catch (error) {
      return SIWEController.setStatus('error')
    } finally {
      this.isSigning = false
    }
  }

  private onCancel() {
    const { isConnected } = AccountController.state
    RouterController.push(isConnected ? 'Account' : 'Connect')
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-siwe-view': W3mConnectingSiweView
  }
}
