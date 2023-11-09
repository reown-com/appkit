import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import { ModalController } from '@web3modal/core'

@customElement('w3m-approve-transaction-view')
export class W3mApproveTransactionView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private resizeObserver?: ResizeObserver = undefined

  private unsubscribe: (() => void)[] = []

  private iframe = document.getElementById('w3m-iframe') as HTMLIFrameElement

  // -- State & Properties -------------------------------- //
  @state() ready = false

  public constructor() {
    super()
    this.unsubscribe.push(
      ModalController.subscribeKey('open', val => {
        if (!val) {
          this.onHideIframe()
        }
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    this.resizeObserver?.unobserve(window.document.body)
  }

  public override firstUpdated() {
    this.iframe.style.display = 'block'
    const blueprint = this.renderRoot.querySelector('div')
    this.resizeObserver = new ResizeObserver(() => {
      const data = blueprint?.getBoundingClientRect()
      const dimensions = data ?? { left: 0, top: 0, width: 0, height: 0 }
      this.iframe.style.width = `${dimensions.width}px`
      this.iframe.style.height = `${dimensions.height}px`
      this.iframe.style.left = `${dimensions.left}px`
      this.iframe.style.top = `${dimensions.top}px`
      this.ready = true
    })
    this.resizeObserver.observe(window.document.body)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (this.ready) {
      this.onShowIframe()
    }

    return html`<div></div>`
  }

  // -- Private ------------------------------------------- //
  private onShowIframe() {
    this.iframe.animate(
      [
        { opacity: 0, transform: 'scale(.95)' },
        { opacity: 1, transform: 'scale(1)' }
      ],
      { duration: 200, easing: 'ease', fill: 'forwards', delay: 300 }
    )
  }

  private async onHideIframe() {
    await this.iframe.animate(
      [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(.95)' }
      ],
      { duration: 200, easing: 'ease', fill: 'forwards' }
    ).finished
    this.iframe.style.display = 'none'
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-approve-transaction-view': W3mApproveTransactionView
  }
}
