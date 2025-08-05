import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-router-container')
export class WuiRouterContainer extends LitElement {
  static override styles = styles

  private resizeObserver?: ResizeObserver = undefined

  @property({ type: String }) view: string = ''

  @property({ type: String }) transitionDuration: string = '0.2s'

  @property({ type: String }) transitionFunction: string = 'cubic-bezier(0.4, 0, 0.2, 1)'

  @property({ type: Number }) history: string[] = []

  @property({ attribute: false }) public onRenderPages: (view: string) => void = () => {}

  @state() private viewState: string = this.view

  @state() private viewDirection: string = ''

  @state() private prevHeight: string = '0px'

  @state() private prevHistoryLength = 1

  public override updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('view')) {
      this.onViewChange(this.view)
    }
  }

  public override firstUpdated() {
    this.viewState = this.view
    this.style.setProperty('--wui-router-container-transition-function', this.transitionFunction)

    this.resizeObserver = new ResizeObserver(([content]) => {
      const newHeight = `${content?.contentRect.height}px`
      const prevHeight = this.prevHeight || newHeight

      if (this.prevHeight !== '0px') {
        this.style.setProperty(
          '--wui-router-container-transition-duration',
          this.transitionDuration
        )
        this.style.setProperty('--prev-height', prevHeight)
        void this.offsetHeight
        this.style.setProperty('--new-height', newHeight)
        this.prevHeight = newHeight
      } else {
        this.viewDirection = ''
        this.style.setProperty('--new-height', newHeight)
        this.prevHeight = newHeight
      }
    })
    this.resizeObserver?.observe(this.getWrapper())
  }

  public override disconnectedCallback() {
    this.resizeObserver?.unobserve(this.getWrapper())
  }

  public override render() {
    return html`
      <div class="container">
        <div
          class="page"
          view-direction="${this.viewDirection}"
          @slotchange=${() => this.requestUpdate()}
        >
          ${this.onRenderPages(this.viewState)}
        </div>
      </div>
    `
  }

  private onViewChange(newView: string) {
    let direction = 'next'
    if (this.history.length < this.prevHistoryLength) {
      direction = 'prev'
    }

    this.prevHistoryLength = this.history.length
    this.viewDirection = direction

    setTimeout(() => {
      this.viewState = newView
    }, 200)
  }

  private getWrapper() {
    return this.shadowRoot?.querySelector('div.page') as HTMLElement
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-router-container': WuiRouterContainer
  }
}
