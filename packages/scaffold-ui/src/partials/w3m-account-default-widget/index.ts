import {
  AccountController,
  CoreHelperUtil,
  ModalController,
  RouterController,
  StorageUtil,
  ConnectorController,
  EventsController,
  ConnectionController,
  SnackController,
  ConstantsUtil as CommonConstantsUtil,
  OptionsController,
  ChainController,
  type AccountType
} from '@reown/appkit-core'
import { customElement, UiHelperUtil } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ConstantsUtil, type ChainNamespace } from '@reown/appkit-common'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet'

import styles from './styles.js'

@customElement('w3m-account-default-widget')
export class W3mAccountDefaultWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public caipAddress = AccountController.state.caipAddress

  @state() public address = CoreHelperUtil.getPlainAddress(AccountController.state.caipAddress)

  @state() public allAccounts: AccountType[] = AccountController.state.allAccounts

  @state() private profileImage = AccountController.state.profileImage

  @state() private profileName = AccountController.state.profileName

  @state() private disconnecting = false

  @state() private balance = AccountController.state.balance

  @state() private balanceSymbol = AccountController.state.balanceSymbol

  @state() private features = OptionsController.state.features

  @state() private namespace = ChainController.state.activeChain

  @state() private chainId = ChainController.state.activeCaipNetwork?.id

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribeKey('caipAddress', val => {
          this.address = CoreHelperUtil.getPlainAddress(val)
          this.caipAddress = val
        }),
        AccountController.subscribeKey('balance', val => (this.balance = val)),
        AccountController.subscribeKey('balanceSymbol', val => (this.balanceSymbol = val)),
        AccountController.subscribeKey('profileName', val => (this.profileName = val)),
        AccountController.subscribeKey('profileImage', val => (this.profileImage = val)),
        OptionsController.subscribeKey('features', val => (this.features = val)),
        AccountController.subscribeKey('allAccounts', allAccounts => {
          this.allAccounts = allAccounts
        }),
        ChainController.subscribeKey('activeChain', val => (this.namespace = val)),
        ChainController.subscribeKey('activeCaipNetwork', val => {
          if (val) {
            const [namespace, chainId] = val?.caipNetworkId?.split(':') || []
            if (namespace && chainId) {
              this.namespace = namespace as ChainNamespace
              this.chainId = chainId
            }
          }
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.caipAddress) {
      return null
    }

    const shouldShowMultiAccount =
      ChainController.state.activeChain !== ConstantsUtil.CHAIN.SOLANA &&
      this.allAccounts.length > 1

    return html`<wui-flex
        flexDirection="column"
        .padding=${['0', 'xl', 'm', 'xl'] as const}
        alignItems="center"
        gap="l"
      >
        ${shouldShowMultiAccount ? this.multiAccountTemplate() : this.singleAccountTemplate()}
        <wui-flex flexDirection="column" alignItems="center">
          <wui-text variant="paragraph-500" color="fg-200">
            ${CoreHelperUtil.formatBalance(this.balance, this.balanceSymbol)}
          </wui-text>
        </wui-flex>
        ${this.explorerBtnTemplate()}
      </wui-flex>

      <wui-flex flexDirection="column" gap="xs" .padding=${['0', 's', 's', 's'] as const}>
        ${this.authCardTemplate()} <w3m-account-auth-button></w3m-account-auth-button>
        ${this.onrampTemplate()} ${this.swapsTemplate()} ${this.activityTemplate()}
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
      </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private onrampTemplate() {
    const onramp = this.features?.onramp
    const isBitcoin = ChainController.state.activeChain === 'bip122'

    if (!onramp || isBitcoin) {
      return null
    }

    return html`
      <wui-list-item
        data-testid="w3m-account-default-onramp-button"
        iconVariant="blue"
        icon="card"
        ?chevron=${true}
        @click=${this.handleClickPay.bind(this)}
      >
        <wui-text variant="paragraph-500" color="fg-100">Buy crypto</wui-text>
      </wui-list-item>
    `
  }

  private activityTemplate() {
    const isSolana = ChainController.state.activeChain === ConstantsUtil.CHAIN.SOLANA

    return html` <wui-list-item
      iconVariant="blue"
      icon="clock"
      iconSize="sm"
      ?chevron=${!isSolana}
      ?disabled=${isSolana}
      @click=${this.onTransactions.bind(this)}
    >
      <wui-text variant="paragraph-500" color="fg-100" ?disabled=${isSolana}> Activity </wui-text>
      ${isSolana ? html`<wui-tag variant="main">Coming soon</wui-tag>` : ''}
    </wui-list-item>`
  }

  private swapsTemplate() {
    const swaps = this.features?.swaps
    const isEvm = ChainController.state.activeChain === ConstantsUtil.CHAIN.EVM

    if (!swaps || !isEvm) {
      return null
    }

    return html`
      <wui-list-item
        iconVariant="blue"
        icon="recycleHorizontal"
        ?chevron=${true}
        @click=${this.handleClickSwap.bind(this)}
      >
        <wui-text variant="paragraph-500" color="fg-100">Swap</wui-text>
      </wui-list-item>
    `
  }

  private authCardTemplate() {
    const type = StorageUtil.getConnectedConnector()
    const authConnector = ConnectorController.getAuthConnector()
    const { origin } = location
    if (!authConnector || type !== 'ID_AUTH' || origin.includes(CommonConstantsUtil.SECURE_SITE)) {
      return null
    }

    return html`
      <wui-notice-card
        @click=${this.onGoToUpgradeView.bind(this)}
        label="Upgrade your wallet"
        description="Transition to a self-custodial wallet"
        icon="wallet"
        data-testid="w3m-wallet-upgrade-card"
      ></wui-notice-card>
    `
  }

  private handleSwitchAccountsView() {
    RouterController.push('SwitchAddress')
  }

  private handleClickPay() {
    RouterController.push('OnRampProviders')
  }

  private handleClickSwap() {
    RouterController.push('Swap')
  }

  private explorerBtnTemplate() {
    const addressExplorerUrl = AccountController.state.addressExplorerUrl

    if (!addressExplorerUrl) {
      return null
    }

    return html`
      <wui-button size="md" variant="neutral" @click=${this.onExplorer.bind(this)}>
        <wui-icon size="sm" color="inherit" slot="iconLeft" name="compass"></wui-icon>
        Block Explorer
        <wui-icon size="sm" color="inherit" slot="iconRight" name="externalLink"></wui-icon>
      </wui-button>
    `
  }

  private singleAccountTemplate() {
    return html`
      <wui-avatar
        alt=${ifDefined(this.caipAddress)}
        address=${ifDefined(CoreHelperUtil.getPlainAddress(this.caipAddress))}
        imageSrc=${ifDefined(this.profileImage === null ? undefined : this.profileImage)}
        data-testid="single-account-avatar"
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
                  string: this.address || '',
                  charsStart: 4,
                  charsEnd: 4,
                  truncate: 'middle'
                })}
          </wui-text>
          <wui-icon-link
            size="md"
            icon="copy"
            iconColor="fg-200"
            @click=${this.onCopyAddress}
          ></wui-icon-link> </wui-flex
      ></wui-flex>
    `
  }

  private multiAccountTemplate() {
    if (!this.address) {
      throw new Error('w3m-account-view: No account provided')
    }

    const account = this.allAccounts.find(acc => acc.address === this.address)
    const label = AccountController.state.addressLabels.get(this.address)
    if (this.namespace === 'bip122') {
      return this.btcAccountsTemplate()
    }

    return html`
      <wui-profile-button-v2
        .onProfileClick=${this.handleSwitchAccountsView.bind(this)}
        address=${ifDefined(this.address)}
        icon="${account?.type === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT &&
        ChainController.state.activeChain === ConstantsUtil.CHAIN.EVM
          ? 'lightbulb'
          : 'mail'}"
        avatarSrc=${ifDefined(this.profileImage ? this.profileImage : undefined)}
        profileName=${ifDefined(label ? label : this.profileName)}
        .onCopyClick=${this.onCopyAddress.bind(this)}
      ></wui-profile-button-v2>
    `
  }

  private btcAccountsTemplate() {
    return html`<wui-flex gap="m" alignItems="center" flexDirection="column">
      <wui-avatar
        .imageSrc=${ifDefined(this.profileImage ? this.profileImage : undefined)}
        alt=${this.address}
        address=${this.address}
      ></wui-avatar>
      <wui-tabs
        .tabs=${[{ label: 'Payment' }, { label: 'Ordinals' }]}
        .onTabChange=${(index: number) =>
          AccountController.setCaipAddress(
            `bip122:${this.chainId}:${this.allAccounts[index]?.address || ''}`,
            this.namespace
          )}
      ></wui-tabs>
      <wui-flex gap="xs" alignItems="center" justifyContent="center">
        <wui-text variant="large-600" color="fg-100">
          ${UiHelperUtil.getTruncateString({
            string: this.profileName || this.address || '',
            charsStart: this.profileName ? 18 : 4,
            charsEnd: this.profileName ? 0 : 4,
            truncate: this.profileName ? 'end' : 'middle'
          })}
        </wui-text>
        <wui-icon size="sm" color="fg-200" name="copy" id="copy-address"></wui-icon>
      </wui-flex>
    </wui-flex>`
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

  private onTransactions() {
    EventsController.sendEvent({
      type: 'track',
      event: 'CLICK_TRANSACTIONS',
      properties: {
        isSmartAccount:
          AccountController.state.preferredAccountType ===
          W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
      }
    })
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

  private onExplorer() {
    const addressExplorerUrl = AccountController.state.addressExplorerUrl

    if (addressExplorerUrl) {
      CoreHelperUtil.openHref(addressExplorerUrl, '_blank')
    }
  }

  private onGoToUpgradeView() {
    EventsController.sendEvent({ type: 'track', event: 'EMAIL_UPGRADE_FROM_MODAL' })
    RouterController.push('UpgradeEmailWallet')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-default-widget': W3mAccountDefaultWidget
  }
}
