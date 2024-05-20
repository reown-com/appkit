import type { RouterControllerState } from '@web3modal/core'
import {
  ConnectionController,
  ConnectorController,
  EventsController,
  ModalController,
  OptionsController,
  RouterController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'

// -- Helpers ------------------------------------------- //
function headings() {
  const connectorName = RouterController.state.data?.connector?.name
  const walletName = RouterController.state.data?.wallet?.name
  const networkName = RouterController.state.data?.network?.name
  const name = walletName ?? connectorName
  const connectors = ConnectorController.getConnectors()
  const isEmail = connectors.length === 1 && connectors[0]?.id === 'w3m-email'

  return {
    Account: undefined,
    AccountSettings: undefined,
    AllWallets: 'All Wallets',
    ApproveTransaction: 'Approve Transaction',
    BuyInProgress: 'Buy',
    Connect: `Connect ${isEmail ? 'Email' : ''} Wallet`,
    ConnectingExternal: name ?? 'Connect Wallet',
    ConnectingWalletConnect: name ?? 'WalletConnect',
    ConnectingSiwe: 'Sign In',
    Convert: 'Convert',
    ConvertSelectToken: 'Select token',
    ConvertPreview: 'Preview convert',
    Downloads: name ? `Get ${name}` : 'Downloads',
    EmailVerifyOtp: 'Confirm Email',
    EmailVerifyDevice: 'Register Device',
    GetWallet: 'Get a wallet',
    Networks: 'Choose Network',
    OnRampProviders: 'Choose Provider',
    OnRampActivity: 'Activity',
    OnRampTokenSelect: 'Select Token',
    OnRampFiatSelect: 'Select Currency',
    Profile: undefined,
    SelectAddresses: 'Select accounts',
    SwitchNetwork: networkName ?? 'Switch Network',
    SwitchAddress: 'Switch Address',
    Transactions: 'Activity',
    UnsupportedChain: 'Switch Network',
    UpgradeEmailWallet: 'Upgrade your Wallet',
    UpgradeToSmartAccount: undefined,
    UpdateEmailWallet: 'Edit Email',
    UpdateEmailPrimaryOtp: 'Confirm Current Email',
    UpdateEmailSecondaryOtp: 'Confirm New Email',
    WalletReceive: 'Receive',
    WalletCompatibleNetworks: 'Compatible Networks',
    Swap: 'Swap',
    SwapSelectToken: 'Select token',
    SwapPreview: 'Preview swap',
    WalletSend: 'Send',
    WalletSendPreview: 'Review send',
    WalletSendSelectToken: 'Select Token',
    WhatIsABuy: 'What is Buy?',
    WhatIsANetwork: 'What is a network?',
    WhatIsAWallet: 'What is a wallet?'
  }
}

@customElement('w3m-header')
export class W3mHeader extends LitElement {
  public static override styles = [styles]

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties --------------------------------- //
  @state() private heading = headings()[RouterController.state.view]

  @state() private buffering = false

  @state() private showBack = false

  @state() private view = RouterController.state.view

  public constructor() {
    super()
    this.unsubscribe.push(
      RouterController.subscribeKey('view', val => {
        this.onViewChange(val)
        this.onHistoryChange()
        this.view = val
      }),
      ConnectionController.subscribeKey('buffering', val => (this.buffering = val))
    )
  }

  disconnectCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex .padding=${this.getPadding()} justifyContent="space-between" alignItems="center">
        ${this.dynamicButtonTemplate()} ${this.titleTemplate()}
        <wui-icon-link
          ?disabled=${this.buffering}
          icon="close"
          @click=${this.onClose.bind(this)}
          data-testid="w3m-header-close"
        ></wui-icon-link>
      </wui-flex>
      ${this.separatorTemplate()}
    `
  }

  // -- Private ------------------------------------------- //

  // Tempory added to test connecting with SIWE, replace with 'WhatIsAWallet' again when approved
  private onWalletHelp() {
    EventsController.sendEvent({ type: 'track', event: 'CLICK_WALLET_HELP' })
    RouterController.push('WhatIsAWallet')
  }

  private async onClose() {
    if (OptionsController.state.isSiweEnabled) {
      const { SIWEController } = await import('@web3modal/siwe')
      if (SIWEController.state.status !== 'success') {
        await ConnectionController.disconnect()
      }
    }
    ModalController.close()
  }

  private titleTemplate() {
    return html`<wui-text variant="paragraph-700" color="fg-100">${this.heading}</wui-text>`
  }

  private dynamicButtonTemplate() {
    const isConnectHelp = this.view === 'Connect'
    const isApproveTransaction = this.view === 'ApproveTransaction'
    const isUpgradeToSmartAccounts = this.view === 'UpgradeToSmartAccount'
    const isWalletAccountView =
      this.view === 'Account' && OptionsController.state.enableWalletFeatures
    const shouldHideBack = isApproveTransaction || isUpgradeToSmartAccounts

    if (isWalletAccountView) {
      return html`<w3m-network-button
        @click=${() => RouterController.push('Networks')}
        label=${' '}
      >
        <wui-icon name="chevronBottom" size="sm"></wui-icon>
      </w3m-network-button>`
    }

    if (this.showBack && !shouldHideBack) {
      return html`<wui-icon-link
        id="dynamic"
        icon="chevronLeft"
        ?disabled=${this.buffering}
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-link>`
    }

    return html`<wui-icon-link
      data-hidden=${!isConnectHelp}
      id="dynamic"
      icon="helpCircle"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-link>`
  }

  private separatorTemplate() {
    if (!this.heading) {
      return null
    }

    return html`<wui-separator></wui-separator>`
  }

  private getPadding() {
    if (this.heading) {
      return ['l', '2l', 'l', '2l'] as const
    }

    return ['l', '2l', '0', '2l'] as const
  }

  private async onViewChange(view: RouterControllerState['view']) {
    const headingEl = this.shadowRoot?.querySelector('wui-text')
    if (headingEl) {
      const preset = headings()[view]
      await headingEl.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 200,
        fill: 'forwards',
        easing: 'ease'
      }).finished
      this.heading = preset
      headingEl.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        fill: 'forwards',
        easing: 'ease'
      })
    }
  }

  private async onHistoryChange() {
    const { history } = RouterController.state
    const buttonEl = this.shadowRoot?.querySelector('#dynamic')
    if (history.length > 1 && !this.showBack && buttonEl) {
      await buttonEl.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 200,
        fill: 'forwards',
        easing: 'ease'
      }).finished
      this.showBack = true
      buttonEl.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        fill: 'forwards',
        easing: 'ease'
      })
    } else if (history.length <= 1 && this.showBack && buttonEl) {
      await buttonEl.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 200,
        fill: 'forwards',
        easing: 'ease'
      }).finished
      this.showBack = false
      buttonEl.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        fill: 'forwards',
        easing: 'ease'
      })
    }
  }

  private onGoBack() {
    if (RouterController.state.view === 'ConnectingSiwe') {
      RouterController.push('Connect')
    } else {
      RouterController.goBack()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-header': W3mHeader
  }
}
