import {
  AccountController,
  ConnectionController,
  AssetController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  NetworkController,
  RouterController,
  SnackController,
  StorageUtil,
  ConnectorController,
  SendController
} from '@web3modal/core'
import { UiHelperUtil, customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'
import { W3mFrameRpcConstants } from '@web3modal/wallet'

@customElement('w3m-account-settings-view')
export class W3mAccountSettingsView extends LitElement {
  public static override styles = styles

  // -- Members -------------------------------------------- //
  private usubscribe: (() => void)[] = []

  private readonly networkImages = AssetController.state.networkImages

  // -- State & Properties --------------------------------- //
  @state() private address = AccountController.state.address

  @state() private profileImage = AccountController.state.profileImage

  @state() private profileName = AccountController.state.profileName

  @state() private network = NetworkController.state.caipNetwork

  @state() private preferredAccountType = AccountController.state.preferredAccountType

  @state() private disconnecting = false

  @state() private loading = false

  public constructor() {
    super()
    this.usubscribe.push(
      ...[
        AccountController.subscribe(val => {
          if (val.address) {
            this.address = val.address
            this.profileImage = val.profileImage
            this.profileName = val.profileName
            this.preferredAccountType = val.preferredAccountType
          } else {
            ModalController.close()
          }
        })
      ],
      NetworkController.subscribeKey('caipNetwork', val => {
        if (val?.id) {
          this.network = val
        }
      })
    )
  }

  public override disconnectedCallback() {
    this.usubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.address) {
      throw new Error('w3m-account-settings-view: No account provided')
    }

    const networkImage = this.networkImages[this.network?.imageId ?? '']

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
          imageSrc=${ifDefined(this.profileImage)}
        ></wui-avatar>
        <wui-flex flexDirection="column" alignItems="center">
          <wui-flex gap="3xs" alignItems="center" justifyContent="center">
            <wui-text variant="large-600" color="fg-100" data-testid="account-settings-address">
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
        </wui-flex>
      </wui-flex>

      <wui-flex flexDirection="column" gap="m">
        <wui-flex flexDirection="column" gap="xs" .padding=${['0', 'xl', 'm', 'xl'] as const}>
          ${this.emailBtnTemplate()}
          <wui-list-item
            .variant=${networkImage ? 'image' : 'icon'}
            iconVariant="overlay"
            icon="networkPlaceholder"
            imageSrc=${ifDefined(networkImage)}
            ?chevron=${this.isAllowedNetworkSwitch()}
            @click=${this.onNetworks.bind(this)}
            data-testid="account-switch-network-button"
          >
            <wui-text variant="paragraph-500" color="fg-100">
              ${this.network?.name ?? 'Unknown'}
            </wui-text>
          </wui-list-item>
          ${this.togglePreferredAccountBtnTemplate()}
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
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
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

  private togglePreferredAccountBtnTemplate() {
    const networkEnabled = NetworkController.checkIfSmartAccountEnabled()
    const type = StorageUtil.getConnectedConnector()
    const emailConnector = ConnectorController.getEmailConnector()

    if (!emailConnector || type !== 'EMAIL' || !networkEnabled) {
      return null
    }

    const text =
      this.preferredAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
        ? 'Switch to your EOA'
        : 'Switch to your smart account'

    return html`
      <wui-list-item
        variant="icon"
        iconVariant="overlay"
        icon="swapHorizontalBold"
        iconSize="sm"
        ?chevron=${true}
        ?loading=${this.loading}
        @click=${this.changePreferredAccountType.bind(this)}
        data-testid="account-toggle-preferred-account-type"
      >
        <wui-text variant="paragraph-500" color="fg-100">${text}</wui-text>
      </wui-list-item>
    `
  }

  private async changePreferredAccountType() {
    const smartAccountEnabled = NetworkController.checkIfSmartAccountEnabled()
    const accountTypeTarget =
      this.preferredAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT ||
      !smartAccountEnabled
        ? W3mFrameRpcConstants.ACCOUNT_TYPES.EOA
        : W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
    const emailConnector = ConnectorController.getEmailConnector()

    if (!emailConnector) {
      return
    }

    this.loading = true
    await emailConnector?.provider.setPreferredAccount(accountTypeTarget)
    SendController.resetSend()
    this.loading = false
    this.requestUpdate()
  }

  private onGoToUpdateEmail(email: string) {
    RouterController.push('UpdateEmailWallet', { email })
  }

  private onNetworks() {
    if (this.isAllowedNetworkSwitch()) {
      RouterController.push('Networks')
    }
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
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-settings-view': W3mAccountSettingsView
  }
}
