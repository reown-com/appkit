import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  type CaipAddress,
  type CaipNetwork,
  ConstantsUtil as CommonConstantsUtil,
  ParseUtil
} from '@reown/appkit-common'
import {
  ApiController,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  ModalController,
  ModalUtil,
  OptionsController,
  RouterController,
  SIWXUtil,
  SnackController,
  ThemeController
} from '@reown/appkit-controllers'
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

export class W3mModalBase extends LitElement {
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

  @state() private filterByNamespace = ConnectorController.state.filterByNamespace

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
        OptionsController.subscribeKey('enableEmbedded', val => (this.enableEmbedded = val)),
        ConnectorController.subscribeKey('filterByNamespace', val => {
          if (this.filterByNamespace !== val && !ChainController.getAccountData(val)?.caipAddress) {
            ApiController.fetchRecommendedWallets()
            this.filterByNamespace = val
          }
        })
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
    await ModalUtil.safeClose()
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
    const isPrevDisconnected = !CoreHelperUtil.getPlainAddress(this.caipAddress)
    const isNextConnected = CoreHelperUtil.getPlainAddress(caipAddress)
    const sessions = await SIWXUtil.getAllSessions()
    const isNextAuthenticated =
      caipAddress && SIWXUtil.getSIWX()
        ? sessions.some(
            session =>
              session.data.accountAddress === ParseUtil.parseCaipAddress(caipAddress)?.address
          )
        : true

    // When users decline SIWE signature, we should close the modal
    const isDisconnectedInSameNamespace = !isNextConnected && !isSwitchingNamespace

    // If user is switching to another namespace and connected in that namespace, we should go back
    const isSwitchingNamespaceAndConnected =
      isSwitchingNamespace && isNextConnected && isNextAuthenticated

    // If user is in profile wallets view, we should not go back or close the modal
    const isInProfileWalletsView = RouterController.state.view === 'ProfileWallets'

    if (!isInProfileWalletsView) {
      if (isDisconnectedInSameNamespace && !this.enableEmbedded) {
        ModalController.close()
      } else if (isSwitchingNamespaceAndConnected && !this.enableEmbedded) {
        RouterController.goBack()
      } else if (this.enableEmbedded && isPrevDisconnected && isNextConnected) {
        ModalController.close()
      }
    }

    await SIWXUtil.initializeIfEnabled()

    this.caipAddress = caipAddress
    ChainController.setIsSwitchingNamespace(false)
  }

  private onNewNetwork(nextCaipNetwork: CaipNetwork | undefined) {
    // Previous network information
    const prevCaipNetwork = this.caipNetwork
    const prevCaipNetworkId = prevCaipNetwork?.caipNetworkId?.toString()
    const prevChainNamespace = prevCaipNetwork?.chainNamespace
    // Next network information
    const nextNetworkId = nextCaipNetwork?.caipNetworkId?.toString()
    const nextChainNamespace = nextCaipNetwork?.chainNamespace
    const networkIdChanged = prevCaipNetworkId !== nextNetworkId
    const namespaceChanged = prevChainNamespace !== nextChainNamespace
    // Determine if the network change happened within the same namespace
    const isNetworkChangedInSameNamespace = networkIdChanged && !namespaceChanged
    // Use previous network's unsupported status for comparison if namespace hasn't changed
    const wasUnsupportedNetwork =
      prevCaipNetwork?.name === CommonConstantsUtil.UNSUPPORTED_NETWORK_NAME
    /**
     * If user is on connecting external, there is a case that they might select a connector which is in another adapter.
     * In this case, we are switching both network and namespace. And this logic will be triggered.
     * But we don't want to go back because we are already on the connecting external view.
     */
    const isConnectingExternal = RouterController.state.view === 'ConnectingExternal'
    const isInProfileWalletsView = RouterController.state.view === 'ProfileWallets'
    // Check connection status based on the address state *before* this update cycle potentially finishes
    const isNotConnected = !ChainController.getAccountData(nextCaipNetwork?.chainNamespace)
      ?.caipAddress
    // If user is *currently* on the unsupported network screen
    const isUnsupportedNetworkScreen = RouterController.state.view === 'UnsupportedChain'
    const isModalOpen = ModalController.state.open

    let shouldGoBack = false

    if (this.enableEmbedded && RouterController.state.view === 'SwitchNetwork') {
      shouldGoBack = true
    }

    if (isModalOpen && !isConnectingExternal && !isInProfileWalletsView) {
      if (isNotConnected) {
        /*
         * If not connected at all, changing network doesn't necessarily warrant going back from all views.
         * Let's keep the previous logic's intent: go back if not connected and network changed.
         * This handles cases like being on the network selection view.
         */
        if (networkIdChanged) {
          shouldGoBack = true
        }
      } else if (isUnsupportedNetworkScreen) {
        // If on the unsupported screen, any network change should likely go back
        shouldGoBack = true
      } else if (isNetworkChangedInSameNamespace && !wasUnsupportedNetwork) {
        /*
         * If network changed within the *same* namespace, and it wasn't previously unsupported, go back.
         * This handles the case where the user explicitly switches networks via the UI.
         */
        shouldGoBack = true
      }
      /*
       * Note: We are not explicitly checking `ChainController.state.isSwitchingNamespace` here.
       * The `onNewAddress` handler specifically covers the `goBack` logic for successful
       * connections during a namespace switch. This handler focuses on same-namespace
       * switches, leaving the unsupported screen, or initial connection state.
       */
    }
    // Don't go back if the user is on the SIWXSignMessage view
    if (shouldGoBack && RouterController.state.view !== 'SIWXSignMessage') {
      RouterController.goBack()
    }
    // Update the component's state *after* potential goBack()
    this.caipNetwork = nextCaipNetwork
  }

  /*
   * This will only be called if enableEmbedded is true. Since embedded
   * mode doesn't set the modal open state to true to do prefetching
   */
  private prefetch() {
    if (!this.hasPrefetched) {
      ApiController.prefetch()
      ApiController.fetchWalletsByPage({ page: 1 })
      this.hasPrefetched = true
    }
  }
}

@customElement('w3m-modal')
export class W3mModal extends W3mModalBase {}

@customElement('appkit-modal')
export class AppKitModal extends W3mModalBase {}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal': W3mModal
    'appkit-modal': AppKitModal
  }
}
