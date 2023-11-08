import {
  AccountController,
  ConnectionController,
  CoreHelperUtil,
  ModalController,
  NetworkController,
  OptionsController,
  RouterController,
  SIWEController
} from '@web3modal/core'
import { HelpersUtil } from '@web3modal/utils'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

@customElement('w3m-connecting-siwe-view')
export class W3mConnectingSiweView extends LitElement {
  // -- Members ------------------------------------------- //
  private readonly dappUrl = OptionsController.state.metadata?.url

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
      ${this.urlTemplate()}
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
  private urlTemplate() {
    if (this.dappUrl) {
      return html`<wui-flex .padding=${['0', '0', 'l', '0'] as const} justifyContent="center">
        <wui-button size="sm" variant="accentBg" @click=${this.onDappLink.bind(this)}>
          ${this.dappUrl}
          <wui-icon size="sm" color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        </wui-button>
      </wui-flex>`
    }

    return null
  }

  private onDappLink() {
    if (this.dappUrl) {
      CoreHelperUtil.openHref(this.dappUrl, '_blank')
    }
  }

  private async onSign() {
    this.isSigning = true
    try {
      const siweClient = SIWEController._getClient()
      SIWEController.setStatus('loading')
      const nonce = await siweClient.getNonce()
      const { address } = AccountController.state.value
      if (!address) {
        throw new Error('An address is required to create a SIWE message.')
      }
      const chainId = HelpersUtil.caipNetworkIdToNumber(NetworkController.state.caipNetwork?.id)
      if (!chainId) {
        throw new Error('A chainId is required to create a SIWE message.')
      }
      const message = siweClient.createMessage({ address, nonce, chainId })
      const signature = await ConnectionController.signMessage(message)

      const isValid = await siweClient.verifyMessage({ message, signature })

      if (!isValid) {
        throw new Error('Error verifying SIWE signature')
      }

      const session = await siweClient.getSession()
      if (!session) {
        throw new Error('Error verifying SIWE signature')
      }
      if (siweClient.onSignIn) {
        siweClient.onSignIn(session)
      }

      SIWEController.setStatus('success')
      ModalController.close()

      return session
    } catch (error) {
      return SIWEController.setStatus('error')
    } finally {
      this.isSigning = false
    }
  }

  private onCancel() {
    RouterController.push('Connect')
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-siwe-view': W3mConnectingSiweView
  }
}
