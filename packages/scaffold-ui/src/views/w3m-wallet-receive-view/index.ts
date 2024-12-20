import {
  AccountController,
  AssetUtil,
  CoreHelperUtil,
  ChainController,
  RouterController,
  SnackController,
  ThemeController
} from '@reown/appkit-core'
import { UiHelperUtil, customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { state } from 'lit/decorators.js'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-wallet-receive-view')
export class W3mWalletReceiveView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private address = AccountController.state.address

  @state() private profileName = AccountController.state.profileName

  @state() private network = ChainController.state.activeCaipNetwork

  @state() private preferredAccountType = AccountController.state.preferredAccountType

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribe(val => {
          if (val.address) {
            this.address = val.address
            this.profileName = val.profileName
            this.preferredAccountType = val.preferredAccountType
          } else {
            SnackController.showError('Account not found')
          }
        })
      ],
      ChainController.subscribeKey('activeCaipNetwork', val => {
        if (val?.id) {
          this.network = val
        }
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.address) {
      throw new Error('w3m-wallet-receive-view: No account provided')
    }

    const networkImage = AssetUtil.getNetworkImage(this.network)

    return html` <wui-flex
      flexDirection="column"
      .padding=${['0', 'l', 'l', 'l'] as const}
      alignItems="center"
    >
      <wui-chip-button
        data-testid="receive-address-copy-button"
        @click=${this.onCopyClick.bind(this)}
        text=${UiHelperUtil.getTruncateString({
          string: this.profileName || this.address || '',
          charsStart: this.profileName ? 18 : 4,
          charsEnd: this.profileName ? 0 : 4,
          truncate: this.profileName ? 'end' : 'middle'
        })}
        icon="copy"
        size="sm"
        imageSrc=${networkImage ? networkImage : ''}
        variant="gray"
      ></wui-chip-button>
      <wui-flex
        flexDirection="column"
        .padding=${['l', '0', '0', '0'] as const}
        alignItems="center"
        gap="s"
      >
        <wui-qr-code
          size=${232}
          theme=${ThemeController.state.themeMode}
          uri=${this.address}
          ?arenaClear=${true}
          color=${ifDefined(ThemeController.state.themeVariables['--w3m-qr-color'])}
          data-testid="wui-qr-code"
        ></wui-qr-code>
        <wui-text variant="paragraph-500" color="fg-100" align="center">
          Copy your address or scan this QR code
        </wui-text>
      </wui-flex>
      ${this.networkTemplate()}
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  networkTemplate() {
    const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks()
    const isNetworkEnabledForSmartAccounts = ChainController.checkIfSmartAccountEnabled()
    const caipNetwork = ChainController.state.activeCaipNetwork

    if (
      this.preferredAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT &&
      isNetworkEnabledForSmartAccounts
    ) {
      if (!caipNetwork) {
        return null
      }

      return html`<wui-compatible-network
        @click=${this.onReceiveClick.bind(this)}
        text="Only receive assets on this network"
        .networkImages=${[AssetUtil.getNetworkImage(caipNetwork) ?? '']}
      ></wui-compatible-network>`
    }
    const slicedNetworks = requestedCaipNetworks
      ?.filter(network => network?.assets?.imageId)
      ?.slice(0, 5)
    const imagesArray = slicedNetworks.map(AssetUtil.getNetworkImage).filter(Boolean) as string[]

    return html`<wui-compatible-network
      @click=${this.onReceiveClick.bind(this)}
      text="Only receive assets on these networks"
      .networkImages=${imagesArray}
    ></wui-compatible-network>`
  }

  onReceiveClick() {
    RouterController.push('WalletCompatibleNetworks')
  }

  onCopyClick() {
    try {
      if (this.address) {
        CoreHelperUtil.copyToClopboard(this.address)
        SnackController.showSuccess('Address copied')
      }
    } catch {
      SnackController.showError('Failed to copy')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-receive-view': W3mWalletReceiveView
  }
}
