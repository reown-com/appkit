import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import {
  ModalController,
  ConnectorController,
  ThemeController,
  RouterController
} from '@web3modal/core'

// -- Variables ------------------------------------------- //
const PAGE_HEIGHT = 400
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

    this.bodyObserver = new ResizeObserver(() => {
      this.iframe.style.width = `${PAGE_WIDTH}px`
      this.iframe.style.height = `${PAGE_HEIGHT}px`
      this.iframe.style.left = `calc(50% - ${PAGE_WIDTH / 2}px)`
      this.iframe.style.top = `calc(50% - ${PAGE_HEIGHT / 2}px + ${HEADER_HEIGHT / 2}px)`
      this.ready = true
    })
    this.bodyObserver.observe(window.document.body)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (this.ready) {
      this.onShowIframe()
    }

    return html`<div data-ready=${this.ready}></div>`
  }

  // -- Private ------------------------------------------- //
  private onShowIframe() {
    const isMobile = window.innerWidth <= 430
    this.iframe.animate(
      [
        { opacity: 0, transform: isMobile ? 'translateY(50px)' : 'scale(.95)' },
        { opacity: 1, transform: isMobile ? 'translateY(0)' : 'scale(1)' }
      ],
      { duration: 200, easing: 'ease', fill: 'forwards' }
    )
  }

  private async onHideIframe() {
    this.iframe.style.display = 'none'
    await this.iframe.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 200,
      easing: 'ease',
      fill: 'forwards'
    }).finished
  }

  private async syncTheme() {
    const emailConnector = ConnectorController.getEmailConnector()
    if (emailConnector) {
      await emailConnector.provider.syncTheme({
        themeVariables: ThemeController.getSnapshot().themeVariables
      })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-approve-transaction-view': W3mApproveTransactionView
  }
}
