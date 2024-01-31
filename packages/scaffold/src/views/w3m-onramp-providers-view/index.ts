import {
  // CoreHelperUtil,
  AccountController,
  ConstantsUtil,
  OnRampController,
  type OnRampProvider,
  RouterController,
  NetworkController,
  BlockchainApiController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import type { CoinbasePaySDKChainNameValues } from '@web3modal/core/src/utils/ConstantsUtil'
import { initOnRamp } from '@coinbase/cbpay-js'
import type { CBPayInstanceType } from '@coinbase/cbpay-js'

@customElement('w3m-onramp-providers-view')
export class W3mOnRampProvidersView extends LitElement {
  private unsubscribe: (() => void)[] = []

  @state() private providers: OnRampProvider[] = OnRampController.state.providers

  @state() private onrampInstance: CBPayInstanceType | null = null

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

  public override firstUpdated(): void {
    const urlPromises = this.providers.map(async provider => {
      if (provider.name === 'coinbase') {
        return await this.getCoinbaseOnRampURL()
      }

      return Promise.resolve(provider?.url)
    })

    Promise.all(urlPromises).then(urls => {
      this.providers = this.providers.map((provider, index) => ({
        ...provider,
        url: urls[index] || ''
      }))
    })

    const address = AccountController.state.address
    const network = NetworkController.state.caipNetwork

    if (!address) {
      throw new Error('No address found')
    }

    if (!network?.name) {
      throw new Error('No network found')
    }

    const defaultNetwork =
      ConstantsUtil.WC_COINBASE_PAY_SDK_CHAIN_NAME_MAP[
        network.name as CoinbasePaySDKChainNameValues
      ] ?? ConstantsUtil.WC_COINBASE_PAY_SDK_FALLBACK_CHAIN

    initOnRamp(
      {
        appId: ConstantsUtil.WC_COINBASE_ONRAMP_APP_ID,
        widgetParameters: {
          destinationWallets: [
            { address, blockchains: ConstantsUtil.WC_COINBASE_PAY_SDK_CHAINS, assets: ['USDC'] }
          ],
          defaultNetwork
        },
        experienceLoggedIn: 'popup',
        experienceLoggedOut: 'popup',
        closeOnExit: true,
        closeOnSuccess: true,
        onExit: () => {
          console.log('ONRAMP EXIT')
        },
        onSuccess: res => {
          console.log('ONRAMP SUCCESS', res)
          // RouterController.push('OnRampActivity')
        },
        onEvent: metadata => {
          console.log('ONRAMP EVENT', metadata)
        }
      },
      (_, instance) => {
        this.onrampInstance = instance
      }
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
          ?disabled=${!provider.url}
        ></wui-onramp-provider-item>
      `
    )
  }

  private onClickProvider(provider: OnRampProvider) {
    OnRampController.setSelectedProvider(provider)
    RouterController.push('BuyInProgress')
    // CoreHelperUtil.openHref(provider.url, 'popupWindow', 'width=600,height=800,scrollbars=yes')
    this.onrampInstance?.open()
  }

  private async getCoinbaseOnRampURL() {
    const address = AccountController.state.address
    const network = NetworkController.state.caipNetwork

    if (!address) {
      throw new Error('No address found')
    }

    if (!network?.name) {
      throw new Error('No network found')
    }

    const defaultNetwork =
      ConstantsUtil.WC_COINBASE_PAY_SDK_CHAIN_NAME_MAP[
        network.name as CoinbasePaySDKChainNameValues
      ] ?? ConstantsUtil.WC_COINBASE_PAY_SDK_FALLBACK_CHAIN

    return await BlockchainApiController.generateOnRampURL({
      defaultNetwork,
      destinationWallets: [
        { address, blockchains: ConstantsUtil.WC_COINBASE_PAY_SDK_CHAINS, assets: ['USDC'] }
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
