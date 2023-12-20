import {
  CoinbaseApiController,
  CoreHelperUtil,
  type CoinbaseTransaction,
  RouterController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

type Provider = 'coinbase' | 'moonpay' | 'stripe' | 'paypal'
type ProviderOption = {
  label: string
  name: Provider
  feeRange: string
  imageURL: string
}

const onRampProviders: Array<ProviderOption> = [
  {
    label: 'Coinbase',
    name: 'coinbase',
    feeRange: '1-2%',
    imageURL: 'https://2wula1angr9l0q9u.public.blob.vercel-storage.com/coinbase.png'
  }
]

@customElement('w3m-onramp-providers-view')
export class W3mOnRampProvidersView extends LitElement {
  @state() private providers = onRampProviders

  @state() private selectedProvider: Provider = ''

  @state() private coinbaseTransactions: CoinbaseTransaction[] = []
  @state() private coinbaseTransactionsInitialized: boolean = false

  @state() private intervalId: NodeJS.Timeout | null = null
  @state() private startTime: number | null = null

  public constructor() {
    super()
    this.providers = this.providers.map(provider => {
      if (provider.name === 'coinbase') {
        provider.url = this.getCoinbaseOnRampURL()
        return provider
      }
      return provider
    })
  }

  public override disconnectedCallback() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
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
    return onRampProviders.map(
      provider => html`
        <wui-onramp-provider-item
          label=${provider.label}
          imageURL=${provider.imageURL}
          feeRange=${provider.feeRange}
          @click=${() => {
            this.onClickProvider(provider)
          }}
        ></wui-onramp-provider-item>
      `
    )
  }

  private onClickProvider(provider: ProviderOption) {
    this.selectedProvider = provider.name
    CoreHelperUtil.openHref(provider.url, '_blank')

    switch (provider.name) {
      case 'coinbase':
        this.startTime = Date.now()
        this.initializeCoinbaseTransactions()
        break

      default:
        break
    }
  }

  private getCoinbaseOnRampURL() {
    return CoinbaseApiController.generateOnRampURL({
      appId: process.env['NEXT_PUBLIC_COINBASE_APP_ID'] ?? '',
      destinationWallets: [
        {
          address: '0xf5B035287c1465F29C7e08FbB5c3b8a4975Bf831',
          blockchains: ['ethereum'],
          assets: ['USDC']
        }
      ],
      partnerUserId: '0xf5B035287c1465F29C7e08FbB5c3b8a4975Bf831'
    })
  }

  private async initializeCoinbaseTransactions() {
    const coinbaseResponse = await CoinbaseApiController.fetchTransactions({
      accountAddress: '',
      pageSize: 2,
      pageKey: ''
    })

    console.log('LOG: initializing...')
    this.coinbaseTransactions = coinbaseResponse.transactions
    this.coinbaseTransactionsInitialized = true
    this.intervalId = setInterval(() => this.watchCoinbaseTransactions(), 10000)
  }

  private async fetchTransactions() {
    const coinbaseResponse = await CoinbaseApiController.fetchTransactions({
      accountAddress: '',
      pageSize: 2,
      pageKey: ''
    })

    const newTransactions = coinbaseResponse.transactions.filter(transaction => {
      return !this.coinbaseTransactions.some(
        existingTransaction => existingTransaction.created_at === transaction.created_at
      )
    })

    if (newTransactions.length > 0) {
      clearInterval(this.intervalId!)
      console.log('New transaction detected:', newTransactions)
      // todo: redirect to onramp activity page
      RouterController.push('OnRampActivity')
    } else if (this.startTime && Date.now() - this.startTime >= 30_000) {
      RouterController.goBack()
      console.log('Clearing interval:', newTransactions)
      clearInterval(this.intervalId!)
    }
  }

  private async watchCoinbaseTransactions() {
    try {
      if (!this.coinbaseTransactionsInitialized) {
        console.log('LOG: not initialized yet...')
        return
      }
      await this.fetchTransactions()
    } catch (error) {
      console.error(error)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-providers-view': W3mOnRampProvidersView
  }
}
