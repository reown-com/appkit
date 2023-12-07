import {
  AccountController,
  ConnectionController,
  CoreHelperUtil,
  ModalController,
  NetworkController,
  RouterController,
  SnackController,
  ConstantsUtil,
  AssetUtil
  StorageUtil,
  EventsController,
  ConnectionController,
  SnackController
} from '@web3modal/core'
import type { CaipNetworkCoinbaseNetwork } from '@web3modal/core'
import { UiHelperUtil, customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

import { initOnRamp } from '@coinbase/cbpay-js'
import type { CBPayInstanceType } from '@coinbase/cbpay-js'

// -- Constants ----------------------------------------- //
const coinbaseAppID = process.env['NEXT_PUBLIC_COINBASE_APP_ID']

const tabs = [{ label: 'Tokens' }, { label: 'NFTs' }, { label: 'Activity' }]

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  public static override styles = styles

  // -- Members -------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties --------------------------------- //
  @state() private address = AccountController.state.address

  @state() private profileImage = AccountController.state.profileImage

  @state() private profileName = AccountController.state.profileName

  @state() private balance = AccountController.state.balance

  @state() private balanceSymbol = AccountController.state.balanceSymbol

  @state() private network = NetworkController.state.caipNetwork

  @state() private onrampInstance: CBPayInstanceType | null = null

  @state() private disconnecting = false

  public constructor() {
    super()
    this.unsubscribe.push(
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
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
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
            <wui-text variant="2xl-500" color="fg-100">
              ${CoreHelperUtil.formatBalance(this.balance, this.balanceSymbol)}
            </wui-text>
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
          .loading=${this.disconnecting}
          @click=${this.onDisconnect.bind(this)}
          data-testid="disconnect-button"
        >
          <wui-text variant="paragraph-500" color="fg-200">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>

      <wui-flex flexDirection="column" gap="m">
        <wui-flex .padding=${['0', 'xl', '0', 'xl']} gap="1xs" class="account-links">
          <wui-flex size="lg" @click=${this.handleClickPay.bind(this)}>
            <wui-icon color="accent-100" name="wallet2"></wui-icon>
          </wui-flex>
          <wui-flex size="lg">
            <wui-icon color="accent-100" name="recycleHorizontal"></wui-icon>
          </wui-flex>
          <wui-flex size="lg">
            <wui-icon color="accent-100" name="arrowBottomCircle"></wui-icon>
          </wui-flex>
          <wui-flex size="lg">
            <wui-icon color="accent-100" name="send"></wui-icon>
          </wui-flex>
        </wui-flex>

        <wui-flex .padding=${['0', 'xl', '0', 'xl']}>
          <wui-tabs .tabs=${tabs}></wui-tabs>
        </wui-flex>

        <wui-flex flexDirection="column" gap="xs" .padding=${['0', 'xl', 'xl', 'xl'] as const}>
          <w3m-transactions-view></w3m-transactions-view>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onTransactions() {
    EventsController.sendEvent({ type: 'track', event: 'CLICK_TRANSACTIONS' })
    RouterController.push('Transactions')
  }

  private async onDisconnect() {
    try {
      this.disconnecting = true
      await ConnectionController.disconnect()
      EventsController.sendEvent({ type: 'track', event: 'DISCONNECT_SUCCESS' })
      ModalController.close()
    } catch {
      EventsController.sendEvent({ type: 'track', event: 'DISCONNECT_ERROR' })
      SnackController.showError('Failed to disconnect')
    } finally {
      this.disconnecting = false
    }
  }

  private isAllowedNetworkSwitch() {
    const { requestedCaipNetworks } = NetworkController.state
    const isMultiNetwork = requestedCaipNetworks ? requestedCaipNetworks.length > 1 : false
    const isValidNetwork = requestedCaipNetworks?.find(({ id }) => id === this.network?.id)

    return isMultiNetwork || !isValidNetwork
  }

  private onNetworks() {
    if (this.isAllowedNetworkSwitch()) {
      RouterController.push('Networks')
    }
  }

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
        this.onrampInstance = instance
      }
    )
  }
  private onAccountSettings() {
    RouterController.push('AccountSettings')
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
