import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  ApiController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-list-wallet'

@customElement('w3m-all-wallets-widget')
export class W3mAllWalletsWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors

  @state() private count = ApiController.state.count

  @state() private isFetchingRecommendedWallets = ApiController.state.isFetchingRecommendedWallets

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val)),
      ApiController.subscribeKey('count', val => (this.count = val)),
      ApiController.subscribeKey(
        'isFetchingRecommendedWallets',
        val => (this.isFetchingRecommendedWallets = val)
      )
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const wcConnector = this.connectors.find(c => c.id === 'walletConnect')
    const { allWallets } = OptionsController.state

    if (!wcConnector || allWallets === 'HIDE') {
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
        tabIdx=${ifDefined(this.tabIdx)}
        .loading=${this.isFetchingRecommendedWallets}
        loadingSpinnerColor=${this.isFetchingRecommendedWallets ? 'fg-300' : 'accent-100'}
      ></wui-list-wallet>
    `
  }

  // -- Private ------------------------------------------- //
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
