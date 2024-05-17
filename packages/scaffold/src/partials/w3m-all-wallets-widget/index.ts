import {
  ApiController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  OptionsController,
  RouterController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

@customElement('w3m-all-wallets-widget')
export class W3mAllWalletsWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors
  @state() private count = ApiController.state.count

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val)),
      ApiController.subscribeKey('count', val => (this.count = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const connector = this.connectors.find(c => c.type === 'WALLET_CONNECT')
    const { allWallets } = OptionsController.state

    if (!connector || allWallets === 'HIDE') {
      return null
    }

    if (allWallets === 'ONLY_MOBILE' && !CoreHelperUtil.isMobile()) {
      return null
    }

    const featuredCount = ApiController.state.featured.length
    const rawCount = this.count + featuredCount
    const roundedCount = rawCount < 10 ? rawCount : Math.floor(rawCount / 10) * 10
    const tagLabel = roundedCount < rawCount ? `${roundedCount}+` : `${roundedCount}`

    return html`
      <wui-list-wallet
        name="All Wallets"
        walletIcon="allWallets"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${tagLabel}
        tagVariant="shade"
        data-testid="all-wallets"
      ></wui-list-wallet>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onAllWallets() {
    EventsController.sendEvent({ type: 'track', event: 'CLICK_ALL_WALLETS' })
    RouterController.push('AllWallets')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-widget': W3mAllWalletsWidget
  }
}
