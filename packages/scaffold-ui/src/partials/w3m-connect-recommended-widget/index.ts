import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { WcWallet } from '@reown/appkit-controllers'
import {
  AssetUtil,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'

import { WalletUtil } from '../../utils/WalletUtil.js'

// We display maximum 4 recommended wallets
const DISPLAYED_WALLETS_AMOUNT = 4

@customElement('w3m-connect-recommended-widget')
export class W3mConnectRecommendedWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @property() public wallets: WcWallet[] = []

  @state() private loading = false

  public constructor() {
    super()

    if (CoreHelperUtil.isTelegram() && CoreHelperUtil.isIos()) {
      this.loading = !ConnectionController.state.wcUri
      this.unsubscribe.push(
        ConnectionController.subscribeKey('wcUri', val => (this.loading = !val))
      )
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const { connectors } = ConnectorController.state
    const { customWallets, featuredWalletIds } = OptionsController.state

    const wcConnector = connectors.find(c => c.id === 'walletConnect')
    const injectedConnectors = connectors.filter(
      c => c.type === 'INJECTED' || c.type === 'ANNOUNCED' || c.type === 'MULTI_CHAIN'
    )

    if (!wcConnector && !injectedConnectors.length && !customWallets?.length) {
      return null
    }

    const isEmailEnabled = Boolean(
      OptionsController.state.features?.email || OptionsController.state.remoteFeatures?.email
    )
    const isSocialsEnabled =
      (Array.isArray(OptionsController.state.features?.socials) &&
        OptionsController.state.features?.socials.length > 0) ||
      (Array.isArray(OptionsController.state.remoteFeatures?.socials) &&
        OptionsController.state.remoteFeatures?.socials.length > 0)

    const injectedWallets = injectedConnectors.filter(i => i.name !== 'Browser Wallet')

    const featuredWalletAmount = featuredWalletIds?.length || 0
    const customWalletAmount = customWallets?.length || 0
    const injectedWalletAmount = injectedWallets.length || 0
    const emailWalletAmount = isEmailEnabled ? 1 : 0
    const socialWalletAmount = isSocialsEnabled ? 1 : 0
    const walletsDisplayed =
      featuredWalletAmount +
      customWalletAmount +
      injectedWalletAmount +
      emailWalletAmount +
      socialWalletAmount

    if (walletsDisplayed >= DISPLAYED_WALLETS_AMOUNT) {
      this.style.cssText = `display: none`

      return null
    }

    // We show maximum 4 recommended wallets, showing 1 less for each already rendered wallet (injected, auth, custom, featured)
    const wallets = WalletUtil.filterOutDuplicateWallets(this.wallets).slice(
      0,
      DISPLAYED_WALLETS_AMOUNT - walletsDisplayed
    )

    if (!wallets.length) {
      this.style.cssText = `display: none`

      return null
    }

    const hasWcConnection = ConnectionController.hasAnyConnection(
      CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
    )

    return html`
      <wui-flex flexDirection="column" gap="2">
        ${wallets.map(
          wallet => html`
            <w3m-list-wallet
              imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
              name=${wallet?.name ?? 'Unknown'}
              @click=${() => this.onConnectWallet(wallet)}
              size="sm"
              tabIdx=${ifDefined(this.tabIdx)}
              ?loading=${this.loading}
              ?disabled=${hasWcConnection}
              rdnsId=${wallet.rdns}
              walletRank=${wallet.order}
            >
            </w3m-list-wallet>
          `
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private onConnectWallet(wallet: WcWallet) {
    if (this.loading) {
      return
    }
    const redirectView = RouterController.state.data?.redirectView
    const connector = ConnectorController.getConnector({
      id: wallet.id,
      rdns: wallet.rdns
    })
    if (connector) {
      RouterController.push('ConnectingExternal', { connector, redirectView })
    } else {
      RouterController.push('ConnectingWalletConnect', { wallet, redirectView })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-recommended-widget': W3mConnectRecommendedWidget
  }
}
