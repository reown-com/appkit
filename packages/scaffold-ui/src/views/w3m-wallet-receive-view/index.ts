import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  AssetUtil,
  ChainController,
  CoreHelperUtil,
  RouterController,
  SnackController,
  ThemeController,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { UiHelperUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-compatible-network'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-qr-code'
import '@reown/appkit-ui/wui-text'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import styles from './styles.js'

@customElement('w3m-wallet-receive-view')
export class W3mWalletReceiveView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private address = ChainController.getAccountData()?.address

  @state() private profileName = ChainController.getAccountData()?.profileName

  @state() private network = ChainController.state.activeCaipNetwork

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ChainController.subscribeChainProp('accountState', val => {
          if (val) {
            this.address = val.address
            this.profileName = val.profileName
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
      .padding=${['0', '4', '4', '4'] as const}
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
        .padding=${['4', '0', '0', '0'] as const}
        alignItems="center"
        gap="4"
      >
        <wui-qr-code
          size=${232}
          theme=${ThemeController.state.themeMode}
          uri=${this.address}
          ?arenaClear=${true}
          color=${ifDefined(ThemeController.state.themeVariables['--w3m-qr-color'])}
          data-testid="wui-qr-code"
        ></wui-qr-code>
        <wui-text variant="lg-regular" color="primary" align="center">
          Copy your address or scan this QR code
        </wui-text>
        <wui-button @click=${this.onCopyClick.bind(this)} size="sm" variant="neutral-secondary">
          <wui-icon slot="iconLeft" size="sm" color="inherit" name="copy"></wui-icon>
          <wui-text variant="md-regular" color="inherit">Copy address</wui-text>
        </wui-button>
      </wui-flex>
      ${this.networkTemplate()}
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  networkTemplate() {
    const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks()
    const isNetworkEnabledForSmartAccounts = ChainController.checkIfSmartAccountEnabled()
    const caipNetwork = ChainController.state.activeCaipNetwork
    const namespaceNetworks = requestedCaipNetworks.filter(
      network => network?.chainNamespace === caipNetwork?.chainNamespace
    )
    if (
      getPreferredAccountType(caipNetwork?.chainNamespace) ===
        W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT &&
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
    const slicedNetworks = namespaceNetworks
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
