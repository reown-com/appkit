import {
  AccountController,
  AssetUtil,
  CoreHelperUtil,
  ModalController,
  NetworkController,
  RouterController,
  SnackController,
  ThemeController
} from '@web3modal/core'
import { UiHelperUtil, customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { state } from 'lit/decorators.js'

@customElement('w3m-receive-view')
export class W3mReceiveView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private address = AccountController.state.address

  @state() private profileName = AccountController.state.profileName

  @state() private network = NetworkController.state.caipNetwork

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribe(val => {
          if (val.address) {
            this.address = val.address
            this.profileName = val.profileName
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
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.address) {
      throw new Error('w3m-receive-view: No account provided')
    }

    const networkImage = AssetUtil.getNetworkImage(this.network)

    return html` <wui-flex
      flexDirection="column"
      .padding=${['xl', 'l', 'l', 'l'] as const}
      alignItems="center"
    >
      <wui-chip-button
        @click=${this.onCopyClick.bind(this)}
        text=${UiHelperUtil.getTruncateString({
          string: this.address ? this.address : '',
          charsStart: this.profileName ? 18 : 4,
          charsEnd: this.profileName ? 0 : 4,
          truncate: this.profileName ? 'end' : 'middle'
        })}
        icon="copy"
        imageSrc=${networkImage ? networkImage : ''}
        variant="shadeSmall"
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
    const networks = NetworkController.getRequestedCaipNetworks()
    const slicedNetworks = networks?.filter(network => network?.imageId)?.slice(0, 5)

    const imagesArray: string[] = []

    for (const network of slicedNetworks) {
      const image = AssetUtil.getNetworkImage(network)
      if (image) {
        imagesArray.push(image)
      }
    }

    return html`<wui-compatible-network
      @click=${this.onReceiveClick.bind(this)}
      text="Only receive from networks"
      .networkImages=${imagesArray}
    ></wui-compatible-network>`
  }

  onReceiveClick() {
    RouterController.push('CompatibleNetworks')
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
    'w3m-receive-view': W3mReceiveView
  }
}
