import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { getW3mThemeVariables } from '@reown/appkit-common'
import {
  ConnectorController,
  ModalController,
  RouterController,
  ThemeController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

import styles from './styles.js'

// -- Variables ------------------------------------------- //
const PAGE_HEIGHT = 600
const PAGE_WIDTH = 360
const HEADER_HEIGHT = 64

@customElement('w3m-approve-transaction-view')
export class W3mApproveTransactionView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private bodyObserver?: ResizeObserver = undefined

  private unsubscribe: (() => void)[] = []

  private iframe = document.getElementById('w3m-iframe') as HTMLIFrameElement

  // -- State & Properties -------------------------------- //
  @state() ready = false

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ModalController.subscribeKey('open', isOpen => {
          if (!isOpen) {
            this.onHideIframe()
            RouterController.popTransactionStack()
          }
        }),
        ModalController.subscribeKey('shake', val => {
          if (val) {
            this.iframe.style.animation = `w3m-shake 500ms var(--wui-ease-out-power-2)`
          } else {
            this.iframe.style.animation = 'none'
          }
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.onHideIframe()
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    this.bodyObserver?.unobserve(window.document.body)
  }

  public override async firstUpdated() {
    await this.syncTheme()

    this.iframe.style.display = 'block'
    const container = this?.renderRoot?.querySelector('div') as HTMLDivElement
    this.bodyObserver = new ResizeObserver(entries => {
      const contentBoxSize = entries?.[0]?.contentBoxSize
      const width = contentBoxSize?.[0]?.inlineSize

      this.iframe.style.height = `${PAGE_HEIGHT}px`

      // Update container size to prevent the iframe from being cut off
      container.style.height = `${PAGE_HEIGHT}px`
      if (width && width <= 430) {
        this.iframe.style.width = '100%'
        this.iframe.style.left = '0px'
        this.iframe.style.bottom = '0px'
        this.iframe.style.top = 'unset'
      } else {
        this.iframe.style.width = `${PAGE_WIDTH}px`
        this.iframe.style.left = `calc(50% - ${PAGE_WIDTH / 2}px)`
        this.iframe.style.top = `calc(50% - ${PAGE_HEIGHT / 2}px + ${HEADER_HEIGHT / 2}px)`
        this.iframe.style.bottom = 'unset'
      }
      this.ready = true
      this.onShowIframe()
    })
    this.bodyObserver.observe(window.document.body)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<div data-ready=${this.ready} id="w3m-frame-container"></div>`
  }

  // -- Private ------------------------------------------- //
  private onShowIframe() {
    const isMobile = window.innerWidth <= 430
    this.iframe.style.animation = isMobile
      ? 'w3m-iframe-zoom-in-mobile 200ms var(--wui-ease-out-power-2)'
      : 'w3m-iframe-zoom-in 200ms var(--wui-ease-out-power-2)'
  }

  private onHideIframe() {
    this.iframe.style.display = 'none'
    this.iframe.style.animation = 'w3m-iframe-fade-out 200ms var(--wui-ease-out-power-2)'
  }

  private async syncTheme() {
    const authConnector = ConnectorController.getAuthConnector()

    if (authConnector) {
      const themeMode = ThemeController.getSnapshot().themeMode
      const themeVariables = ThemeController.getSnapshot().themeVariables

      await authConnector.provider.syncTheme({
        themeVariables,
        w3mThemeVariables: getW3mThemeVariables(themeVariables, themeMode)
      })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-approve-transaction-view': W3mApproveTransactionView
  }
}
