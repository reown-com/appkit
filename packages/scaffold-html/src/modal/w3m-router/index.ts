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

  // -- State & Properties -------------------------------- //
  @state() private view = RouterController.state.view

  public constructor() {
    super()
    RouterController.subscribe('view', view => this.onRouteChange(view))
  }

  public firstUpdated() {
    this.resizeObserver = new ResizeObserver(async ([content]) => {
      const height = `${content.contentRect.height}px`
      if (this.prevHeight !== '0px') {
        this.resizeObserver?.unobserve(this)
        await animate(this, { height: [this.prevHeight, height] }).finished
      }
      this.prevHeight = height
    })
    this.resizeObserver.observe(this)
  }

  public disconnectedCallback() {
    this.resizeObserver?.unobserve(this)
  }

  // -- Render -------------------------------------------- //
  public render() {
    return this.viewTemplate()
  }

  // -- Private ------------------------------------------- //
  private viewTemplate() {
    switch (this.view) {
      case 'Connect':
        return html`<w3m-connect-view></w3m-connect-view>`
      case 'Connecting':
        return html`<w3m-connecting-view></w3m-connecting-view>`
      default:
        return html`<w3m-connect-view></w3m-connect-view>`
    }
  }

  private async onRouteChange(newView: RouterControllerState['view']) {
    await animate(this, { opacity: [1, 0], scale: [1, 1.02] }).finished
    this.view = newView
    animate(this, { opacity: [0, 1], scale: [1.02, 1] })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-router': W3mRouter
  }
}
