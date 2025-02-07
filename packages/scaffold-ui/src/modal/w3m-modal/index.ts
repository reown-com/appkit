import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { type CaipAddress, type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'
import {
  ApiController,
  ChainController,
  CoreHelperUtil,
  ModalController,
  OptionsController,
  RouterController,
  SIWXUtil,
  SnackController,
  ThemeController
} from '@reown/appkit-core'
import { UiHelperUtil, customElement, initializeTheming } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-card'
import '@reown/appkit-ui/wui-flex'

import '../../partials/w3m-alertbar/index.js'
import '../../partials/w3m-header/index.js'
import '../../partials/w3m-snackbar/index.js'
import '../../partials/w3m-tooltip/index.js'
import '../w3m-router/index.js'
import styles from './styles.js'

// -- Helpers --------------------------------------------- //
const SCROLL_LOCK = 'scroll-lock'

@customElement('w3m-modal')
export class W3mModal extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private abortController?: AbortController = undefined

  private hasPrefetched = false

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) private enableEmbedded = OptionsController.state.enableEmbedded

  @state() private open = ModalController.state.open

  @state() private caipAddress = ChainController.state.activeCaipAddress

  @state() private caipNetwork = ChainController.state.activeCaipNetwork

  @state() private shake = ModalController.state.shake

  public constructor() {
    super()
    this.initializeTheming()
    ApiController.prefetchAnalyticsConfig()
    this.unsubscribe.push(
      ...[
        ModalController.subscribeKey('open', val => (val ? this.onOpen() : this.onClose())),
        ModalController.subscribeKey('shake', val => (this.shake = val)),
        ChainController.subscribeKey('activeCaipNetwork', val => this.onNewNetwork(val)),
        ChainController.subscribeKey('activeCaipAddress', val => this.onNewAddress(val)),
        OptionsController.subscribeKey('enableEmbedded', val => (this.enableEmbedded = val))
      ]
    )
  }

  public override firstUpdated() {
    if (this.caipAddress) {
      if (this.enableEmbedded) {
        ModalController.close()
        this.prefetch()

        return
      }

      this.onNewAddress(this.caipAddress)
    }

    if (this.open) {
      this.onOpen()
    }

    if (this.enableEmbedded) {
      this.prefetch()
    }
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    this.onRemoveKeyboardListener()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `
      --local-border-bottom-mobile-radius: ${
        this.enableEmbedded ? 'clamp(0px, var(--wui-border-radius-l), 44px)' : '0px'
      };
    `

    if (this.enableEmbedded) {
      return html`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `
    }

    return this.open
      ? html`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `
      : null
  }

  // -- Private ------------------------------------------- //
  private contentTemplate() {
    return html` <wui-card
      shake="${this.shake}"
      data-embedded="${ifDefined(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`
  }

  private async onOverlayClick(event: PointerEvent) {
    if (event.target === event.currentTarget) {
      await this.handleClose()
    }
  }

  private async handleClose() {
    const isUnsupportedChain = RouterController.state.view === 'UnsupportedChain'
    if (isUnsupportedChain || (await SIWXUtil.isSIWXCloseDisabled())) {
      ModalController.shake()
    } else {
      ModalController.close()
    }
  }

  private initializeTheming() {
    const { themeVariables, themeMode } = ThemeController.state
    const defaultThemeMode = UiHelperUtil.getColorTheme(themeMode)
    initializeTheming(themeVariables, defaultThemeMode)
  }

  private onClose() {
    this.open = false
    this.classList.remove('open')
    this.onScrollUnlock()
    SnackController.hide()
    this.onRemoveKeyboardListener()
  }

  private onOpen() {
    this.open = true
    this.classList.add('open')
    this.onScrollLock()
    this.onAddKeyboardListener()
  }

  private onScrollLock() {
    const styleTag = document.createElement('style')
    styleTag.dataset['w3m'] = SCROLL_LOCK
    styleTag.textContent = `
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `
    document.head.appendChild(styleTag)
  }

  private onScrollUnlock() {
    const styleTag = document.head.querySelector(`style[data-w3m="${SCROLL_LOCK}"]`)
    if (styleTag) {
      styleTag.remove()
    }
  }

  private onAddKeyboardListener() {
    this.abortController = new AbortController()
    const card = this.shadowRoot?.querySelector('wui-card')
    card?.focus()
    window.addEventListener(
      'keydown',
      event => {
        if (event.key === 'Escape') {
          this.handleClose()
        } else if (event.key === 'Tab') {
          const { tagName } = event.target as HTMLElement
          if (tagName && !tagName.includes('W3M-') && !tagName.includes('WUI-')) {
            card?.focus()
          }
        }
      },
      this.abortController
    )
  }

  private onRemoveKeyboardListener() {
    this.abortController?.abort()
    this.abortController = undefined
  }

  private async onNewAddress(caipAddress?: CaipAddress) {
    const isSwitchingNamespace = ChainController.state.isSwitchingNamespace
    const nextConnected = CoreHelperUtil.getPlainAddress(caipAddress)

    // When users decline SIWE signature, we should close the modal
    const isDisconnectedInSameNamespace = !nextConnected && !isSwitchingNamespace

    // If user is switching to another namespace and connected in that namespace, we should go back
    const isSwitchingNamespaceAndConnected = isSwitchingNamespace && nextConnected

    if (isDisconnectedInSameNamespace) {
      ModalController.close()
    } else if (isSwitchingNamespaceAndConnected) {
      RouterController.goBack()
    }

    await SIWXUtil.initializeIfEnabled()

    this.caipAddress = caipAddress
    ChainController.setIsSwitchingNamespace(false)
  }

  private onNewNetwork(nextCaipNetwork: CaipNetwork | undefined) {
    const prevCaipNetworkId = this.caipNetwork?.caipNetworkId?.toString()
    const nextNetworkId = nextCaipNetwork?.caipNetworkId?.toString()
    const networkChanged = prevCaipNetworkId && nextNetworkId && prevCaipNetworkId !== nextNetworkId
    const isSwitchingNamespace = ChainController.state.isSwitchingNamespace
    const isUnsupportedNetwork = this.caipNetwork?.name === ConstantsUtil.UNSUPPORTED_NETWORK_NAME

    /**
     * If user is on connecting external, there is a case that they might select a connector which is in another adapter.
     * In this case, we are switching both network and namespace. And this logic will be triggered.
     * But we don't want to go back because we are already on the connecting external view.
     */
    const isConnectingExternal = RouterController.state.view === 'ConnectingExternal'
    // If user is not connected, we should go back
    const isNotConnected = !this.caipAddress
    // If network has been changed in the same namespace and it's not an unsupported network, we should go back
    const isNetworkChangedInSameNamespace =
      networkChanged && !isUnsupportedNetwork && !isSwitchingNamespace
    // If user is on the unsupported network screen, we should go back when network has been changed
    const isUnsupportedNetworkScreen = RouterController.state.view === 'UnsupportedChain'

    const shouldGoBack =
      !isConnectingExternal &&
      (isNotConnected || isUnsupportedNetworkScreen || isNetworkChangedInSameNamespace)
    if (shouldGoBack) {
      RouterController.goBack()
    }

    this.caipNetwork = nextCaipNetwork
  }

  /*
   * This will only be called if enableEmbedded is true. Since embedded
   * mode doesn't set the modal open state to true to do prefetching
   */
  private prefetch() {
    if (!this.hasPrefetched) {
      this.hasPrefetched = true
      ApiController.prefetch()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal': W3mModal
  }
}
