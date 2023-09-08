import {
  AccountController,
  AssetController,
  ConnectionController,
  CoreHelperUtil,
  ModalController,
  NetworkController,
  RouterController,
  SnackController
} from '@web3modal/core'
import { UiHelperUtil } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  public static override styles = styles

  // -- Members -------------------------------------------- //
  private usubscribe: (() => void)[] = []

  private readonly networkImages = AssetController.state.networkImages

  // -- State & Properties --------------------------------- //
  @state() private address = AccountController.state.address

  @state() private profileImage = AccountController.state.profileImage

  @state() private profileName = AccountController.state.profileName

  @state() private balance = AccountController.state.balance

  @state() private balanceSymbol = AccountController.state.balanceSymbol

  @state() private network = NetworkController.state.caipNetwork

  @state() private disconecting = false

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
      throw new Error('w3m-account-view: No account provided')
    }

    const networkImage = this.networkImages[this.network?.imageId ?? '']

    return html`
      <wui-flex
        flexDirection="column"
        .padding=${['0', 's', 'm', 's'] as const}
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
            <wui-text variant="large-600" color="fg-100">
              ${this.profileName
                ? UiHelperUtil.getTruncateString(this.profileName, 20, 'end')
                : UiHelperUtil.getTruncateString(this.address, 8, 'middle')}
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
            <wui-button size="sm" variant="shade" @click=${this.onExplorer.bind(this)}>
              <wui-icon size="sm" color="inherit" slot="iconLeft" name="compass"></wui-icon>
              Block Explorer
              <wui-icon size="sm" color="inherit" slot="iconRight" name="externalLink"></wui-icon>
            </wui-button>
          </wui-flex>
        </wui-flex>
      </wui-flex>

      <wui-flex flexDirection="column" gap="xs" .padding=${['0', 's', 's', 's'] as const}>
        <wui-list-item
          .variant=${networkImage ? 'image' : 'icon'}
          iconVariant="overlay"
          icon="networkPlaceholder"
          imageSrc=${ifDefined(networkImage)}
          ?chevron=${this.isMultiNetwork()}
          @click=${this.onNetworks.bind(this)}
        >
          <wui-text variant="paragraph-500" color="fg-100">
            ${this.network?.name ?? 'Unknown'}
          </wui-text>
        </wui-list-item>
        <wui-list-item
          variant="icon"
          iconVariant="overlay"
          icon="disconnect"
          ?chevron=${false}
          .loading=${this.disconecting}
          @click=${this.onDisconnect.bind(this)}
        >
          <wui-text variant="paragraph-500" color="fg-200">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private isMultiNetwork() {
    const { requestedCaipNetworks } = NetworkController.state

    return requestedCaipNetworks ? requestedCaipNetworks.length > 1 : false
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
    if (this.isMultiNetwork()) {
      RouterController.push('Networks')
    }
  }

  private async onDisconnect() {
    try {
      this.disconecting = true
      await ConnectionController.disconnect()
      ModalController.close()
    } catch {
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
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-view': W3mAccountView
  }
}
