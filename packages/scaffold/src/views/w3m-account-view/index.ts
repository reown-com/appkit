import {
  AccountController,
  ConnectorController,
  ConnectionController,
  ConstantsUtil,
  CoreHelperUtil,
  EventsController,
  ModalController,
  NetworkController,
  RouterController,
  SnackController,
  StorageUtil,
  ConstantsUtil,
  AssetUtil
} from '@web3modal/core'
import type { CaipNetworkCoinbaseNetwork } from '@web3modal/core'
import { UiHelperUtil, customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

import { initOnRamp } from '@coinbase/cbpay-js'
import type { CBPayInstanceType } from '@coinbase/cbpay-js'

const coinbaseAppID = process.env['NEXT_PUBLIC_COINBASE_APP_ID']

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  public static override styles = styles

  // -- Members -------------------------------------------- //
  private usubscribe: (() => void)[] = []

  // -- State & Properties --------------------------------- //
  @state() private address = AccountController.state.address

  @state() private profileImage = AccountController.state.profileImage

  @state() private profileName = AccountController.state.profileName

  @state() private balance = AccountController.state.balance

  @state() private balanceSymbol = AccountController.state.balanceSymbol

  @state() private network = NetworkController.state.caipNetwork

  @state() private onrampInstance: CBPayInstanceType | null = null

  @state() private disconecting = false

  @state() private connectors = ConnectorController.state.connectors

  @state() private connectorId = ConnectionController.state.connectorId

  public constructor() {
    super()
    this.usubscribe.push(
      ...[
        AccountController.subscribe(val => {
          if (val.address) {
            this.address = val.address
            this.profileImage = val.profileImage
            this.profileName = val.profileName
            this.balance = val.balance
            this.balanceSymbol = val.balanceSymbol
          } else {
            ModalController.close()
          }
        }),
        ConnectorController.subscribeKey('connectors', connectors => {
          this.connectors = connectors
        }),
        ConnectionController.subscribeKey('connectorId', connectorId => {
          this.connectorId = connectorId
        })
      ],
      NetworkController.subscribeKey('caipNetwork', val => {
        if (val?.id) {
          this.network = val
          this.initializeOnRamp()
        }
      })
    )
  }

  public override disconnectedCallback() {
    this.usubscribe.forEach(unsubscribe => unsubscribe())
    this.onrampInstance?.destroy()
  }

  public override firstUpdated() {
    this.initializeOnRamp()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.address) {
      throw new Error('w3m-account-view: No account provided')
    }

    const networkImage = AssetUtil.getNetworkImage(this.network)

    return html`
      <wui-flex
        flexDirection="column"
        .padding=${['0', 'xl', 'm', 'xl'] as const}
        alignItems="center"
        gap="l"
      >
        <wui-avatar
          alt=${this.address}
          address=${this.address}
          imageSrc=${ifDefined(this.profileImage === null ? undefined : this.profileImage)}
        ></wui-avatar>
        <wui-flex flexDirection="column" alignItems="center">
          <wui-flex gap="3xs" alignItems="center" justifyContent="center">
            <wui-text variant="large-600" color="fg-100">
              ${this.profileName
                ? UiHelperUtil.getTruncateString({
                    string: this.profileName,
                    charsStart: 20,
                    charsEnd: 0,
                    truncate: 'end'
                  })
                : UiHelperUtil.getTruncateString({
                    string: this.address,
                    charsStart: 4,
                    charsEnd: 6,
                    truncate: 'middle'
                  })}
            </wui-text>
            <wui-icon-link
              size="md"
              icon="copy"
              iconColor="fg-200"
              @click=${this.onCopyAddress}
            ></wui-icon-link>
          </wui-flex>
          <wui-flex gap="s" flexDirection="column" alignItems="center">
            <wui-text variant="paragraph-500" color="fg-200">
              ${CoreHelperUtil.formatBalance(this.balance, this.balanceSymbol)}
            </wui-text>
            ${this.explorerBtnTemplate()}
          </wui-flex>
        </wui-flex>
      </wui-flex>

      <wui-flex flexDirection="column" gap="xs" .padding=${['0', 's', 's', 's'] as const}>
        ${this.emailCardTemplate()} ${this.emailBtnTemplate()}

        <wui-list-item
          .variant=${networkImage ? 'image' : 'icon'}
          iconVariant="overlay"
          icon="networkPlaceholder"
          imageSrc=${ifDefined(networkImage)}
          ?chevron=${this.isAllowedNetworkSwitch()}
          @click=${this.onNetworks.bind(this)}
          data-testid="w3m-account-select-network"
        >
          <wui-text variant="paragraph-500" color="fg-100">
            ${this.network?.name ?? 'Unknown'}
          </wui-text>
        </wui-list-item>
        <wui-list-item
          iconVariant="blue"
          icon="add"
          iconSize="lg"
          .loading=${!this.onrampInstance}
          ?chevron=${true}
          @click=${this.handleClickPay.bind(this)}
        >
          <wui-text variant="paragraph-500" color="fg-100">Buy crypto</wui-text>
        </wui-list-item>
        <wui-list-item
          iconVariant="blue"
          icon="swapHorizontalBold"
          iconSize="sm"
          ?chevron=${true}
          @click=${this.onTransactions.bind(this)}
        >
          <wui-text variant="paragraph-500" color="fg-100">Activity</wui-text>
        </wui-list-item>
        <wui-list-item
          variant="icon"
          iconVariant="overlay"
          icon="disconnect"
          ?chevron=${false}
          .loading=${this.disconecting}
          @click=${this.onDisconnect.bind(this)}
          data-testid="disconnect-button"
        >
          <wui-text variant="paragraph-500" color="fg-200">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private emailCardTemplate() {
    const type = StorageUtil.getConnectedConnector()
    const emailConnector = ConnectorController.getEmailConnector()
    const { origin } = location
    if (!emailConnector || type !== 'EMAIL' || origin.includes(ConstantsUtil.SECURE_SITE)) {
      return null
    }

    return html`
      <wui-notice-card
        @click=${this.onGoToUpgradeView.bind(this)}
        label="Upgrade your wallet"
        description="Transition to a non-custodial wallet"
        icon="wallet"
      ></wui-notice-card>
    `
  }

  private emailBtnTemplate() {
    const type = StorageUtil.getConnectedConnector()
    const emailConnector = ConnectorController.getEmailConnector()
    if (!emailConnector || type !== 'EMAIL') {
      return null
    }
    const email = emailConnector.provider.getEmail() ?? ''

    return html`
      <wui-list-item
        variant="icon"
        iconVariant="overlay"
        icon="mail"
        iconSize="sm"
        ?chevron=${true}
        @click=${() => this.onGoToUpdateEmail(email)}
      >
        <wui-text variant="paragraph-500" color="fg-100">${email}</wui-text>
      </wui-list-item>
    `
  }

  private handleClickPay() {
    this.onrampInstance?.open()
  }

  private initializeOnRamp() {
    console.log('init onramp')
    const networkName = this.network?.name
    const address = this.address

    if (!coinbaseAppID) {
      throw new Error('NEXT_PUBLIC_COINBASE_APP_ID is not set')
    }

    if (!networkName || !address) {
      return
    }

    const coinbaseChainName =
      ConstantsUtil.WC_COINBASE_PAY_SDK_CHAIN_NAME_MAP?.[networkName as CaipNetworkCoinbaseNetwork]

    if (this.onrampInstance) {
      this.onrampInstance.destroy()
    }

    console.log('this.connectorID', this.connectorId)
    console.log('this.connectors', this.connectors)
    console.log(AccountController.state)

    initOnRamp(
      {
        appId: coinbaseAppID,
        widgetParameters: {
          destinationWallets: [
            {
              address,
              blockchains: [coinbaseChainName],
              assets: ['USDC']
            }
          ],
          partnerUserId: address
        },
        experienceLoggedIn: 'popup',
        experienceLoggedOut: 'popup',
        closeOnExit: true,
        closeOnSuccess: true
      },
      (_, instance) => {
        console.log('init onramp: ready')
        this.onrampInstance = instance
      }
    )
  }

  private explorerBtnTemplate() {
    const { addressExplorerUrl } = AccountController.state

    if (!addressExplorerUrl) {
      return null
    }

    return html`
      <wui-button size="sm" variant="shade" @click=${this.onExplorer.bind(this)}>
        <wui-icon size="sm" color="inherit" slot="iconLeft" name="compass"></wui-icon>
        Block Explorer
        <wui-icon size="sm" color="inherit" slot="iconRight" name="externalLink"></wui-icon>
      </wui-button>
    `
  }

  private isAllowedNetworkSwitch() {
    const { requestedCaipNetworks } = NetworkController.state
    const isMultiNetwork = requestedCaipNetworks ? requestedCaipNetworks.length > 1 : false
    const isValidNetwork = requestedCaipNetworks?.find(({ id }) => id === this.network?.id)

    return isMultiNetwork || !isValidNetwork
  }

  private onCopyAddress() {
    try {
      if (this.address) {
        CoreHelperUtil.copyToClopboard(this.address)
        SnackController.showSuccess('Address copied')
      }
    } catch {
      SnackController.showError('Failed to copy')
    }
  }

  private onNetworks() {
    if (this.isAllowedNetworkSwitch()) {
      RouterController.push('Networks')
    }
  }

  private onTransactions() {
    EventsController.sendEvent({ type: 'track', event: 'CLICK_TRANSACTIONS' })
    RouterController.push('Transactions')
  }

  private async onDisconnect() {
    try {
      this.disconecting = true
      await ConnectionController.disconnect()
      EventsController.sendEvent({ type: 'track', event: 'DISCONNECT_SUCCESS' })
      ModalController.close()
    } catch {
      EventsController.sendEvent({ type: 'track', event: 'DISCONNECT_ERROR' })
      SnackController.showError('Failed to disconnect')
    } finally {
      this.disconecting = false
    }
  }

  private onExplorer() {
    const { addressExplorerUrl } = AccountController.state
    if (addressExplorerUrl) {
      CoreHelperUtil.openHref(addressExplorerUrl, '_blank')
    }
  }

  private onGoToUpgradeView() {
    RouterController.push('UpgradeEmailWallet')
  }

  private onGoToUpdateEmail(email: string) {
    RouterController.push('UpdateEmailWallet', { email })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-view': W3mAccountView
  }
}
