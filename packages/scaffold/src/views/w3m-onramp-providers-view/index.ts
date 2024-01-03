import {
  CoreHelperUtil,
  AccountController,
  ConstantsUtil,
  OnRampController,
  type OnRampProvider,
  RouterController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { generateOnRampURL } from '@coinbase/cbpay-js'

@customElement('w3m-onramp-providers-view')
export class W3mOnRampProvidersView extends LitElement {
  private unsubscribe: (() => void)[] = []

  @state() private providers: OnRampProvider[] = OnRampController.state.providers.map(provider => {
    if (provider.name === 'coinbase') {
      provider.url = this.getCoinbaseOnRampURL()
      return provider
    }
    return provider
  })

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        OnRampController.subscribeKey('providers', val => {
          this.providers = val
        })
      ]
    )
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s" gap="xs">
        ${this.onRampProvidersTemplate()}
      </wui-flex>
      <w3m-onramp-providers-footer></w3m-onramp-providers-footer>
    `
  }

  // -- Private ------------------------------------------- //
  private onRampProvidersTemplate() {
    return this.providers.map(
      provider => html`
        <wui-onramp-provider-item
          label=${provider.label}
          name=${provider.name}
          feeRange=${provider.feeRange}
          @click=${() => {
            this.onClickProvider(provider)
          }}
        ></wui-onramp-provider-item>
      `
    )
  }

  private onClickProvider(provider: OnRampProvider) {
    OnRampController.setSelectedProvider(provider)
    RouterController.push('BuyInProgress')
    CoreHelperUtil.openHref(provider.url, 'popupWindow', 'width=600,height=800,scrollbars=yes')
  }

  private getCoinbaseOnRampURL() {
    const address = AccountController.state.address

    if (!address) {
      throw new Error('No address found')
    }

    return generateOnRampURL({
      appId: ConstantsUtil.WC_COINBASE_ONRAMP_APP_ID,
      destinationWallets: [
        { address, blockchains: ['ethereum', 'avalanche-c-chain', 'polygon'], assets: ['USDC'] }
      ],
      partnerUserId: address
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-providers-view': W3mOnRampProvidersView
  }
}
