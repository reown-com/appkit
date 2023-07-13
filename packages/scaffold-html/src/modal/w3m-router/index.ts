import { RouterController, RouterControllerState } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { animate } from 'motion'
import styles from './styles'

@customElement('w3m-router')
export class W3mRouter extends LitElement {
  public static styles = styles

  // -- Members ------------------------------------------- //
  private resizeObserver?: ResizeObserver = undefined

  private prevHeight = '0px'

  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private view = RouterController.state.view

  public constructor() {
    super()
    this.unsubscribe.push(RouterController.subscribe('view', view => this.onRouteChange(view)))
  }

  public firstUpdated() {
    this.resizeObserver = new ResizeObserver(async ([content]) => {
      const height = `${content.contentRect.height}px`
      if (this.prevHeight !== '0px') {
        await animate(this, { height: [this.prevHeight, height] }, { duration: 0.15 }).finished
        this.style.height = 'auto'
      }
      this.prevHeight = height
    })
    this.resizeObserver.observe(this.getWrapper())
  }

  public disconnectedCallback() {
    this.resizeObserver?.unobserve(this.getWrapper())
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public render() {
    return html`<div>${this.viewTemplate()}</div>`
  }

  // -- Private ------------------------------------------- //
  private viewTemplate() {
    switch (this.view) {
      case 'Connect':
        return html`<w3m-connect-view></w3m-connect-view>`
      case 'ConnectingExternal':
        return html`<w3m-connecting-external-view></w3m-connecting-external-view>`
      case 'Account':
        return html`<w3m-account-view></w3m-account-view>`
      default:
        return html`<w3m-connect-view></w3m-connect-view>`
    }
  }

  private async onRouteChange(newView: RouterControllerState['view']) {
    await animate(this, { opacity: [1, 0], scale: [1, 1.02] }, { duration: 0.15 }).finished
    this.view = newView
    animate(this, { opacity: [0, 1], scale: [0.98, 1] }, { duration: 0.15, delay: 0.05 })
  }

  private getWrapper() {
    return this.shadowRoot?.querySelector('div') as HTMLElement
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-router': W3mRouter
  }
}
