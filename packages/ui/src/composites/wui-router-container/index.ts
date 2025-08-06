import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

function cssDurationToNumber(duration: string) {
  if (duration.endsWith('s')) {
    return Number(duration.replace('s', '')) * 1000
  } else if (duration.endsWith('ms')) {
    return Number(duration.replace('ms', ''))
  }

  return 0
}

@customElement('wui-router-container')
export class WuiRouterContainer extends LitElement {
  static override styles = styles

  private resizeObserver?: ResizeObserver = undefined

  @property({ type: String }) transitionDuration = ''

  @property({ type: String }) transitionFunction = ''

  @property({ type: String }) history = ''

  @property({ type: String }) view: string | undefined = ''

  @property({ attribute: false }) setView: ((view: string) => void) | undefined = undefined

  @state() private viewDirection = ''

  @state() private historyState = ''

  public override updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('history')) {
      const newHistory = this.history

      if (this.historyState !== '' && this.historyState !== newHistory) {
        this.onViewChange(newHistory)
      }
    }

    if (changedProps.has('transitionDuration')) {
      this.style.setProperty('--local-duration', this.transitionDuration)
    }

    if (changedProps.has('transitionFunction')) {
      this.style.setProperty('--local-transition', this.transitionFunction)
    }
  }

  public override firstUpdated() {
    this.style.setProperty('--local-transition', this.transitionFunction)
    this.style.setProperty('--local-duration', this.transitionDuration)
    this.historyState = this.history

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === this.getWrapper()) {
          const newHeight = `${entry.contentRect.height}px`
          this.style.setProperty('--new-height', newHeight)
        }
      }
    })

    this.resizeObserver.observe(this.getWrapper())
  }

  public override disconnectedCallback() {
    const wrapper = this.getWrapper()
    if (wrapper && this.resizeObserver) {
      this.resizeObserver.unobserve(wrapper)
    }
  }

  public override render() {
    return html`
      <div class="container">
        <div class="page" view-direction="${this.viewDirection}">
          <slot></slot>
        </div>
      </div>
    `
  }

  private onViewChange(history: string) {
    const historyArr = history.split(',').filter(Boolean)
    const prevArr = this.historyState.split(',').filter(Boolean)

    const prevLength = prevArr.length
    const newLength = historyArr.length
    const newView = historyArr[historyArr.length - 1] || ''

    let direction = ''
    if (newLength > prevLength) {
      direction = 'next'
    } else if (newLength < prevLength) {
      direction = 'prev'
    } else if (newLength === prevLength && historyArr[newLength - 1] !== prevArr[prevLength - 1]) {
      // If same length but last view changed, treat as next
      direction = 'next'
    }

    this.viewDirection = `${direction}-${newView}`

    const duration = cssDurationToNumber(this.transitionDuration)

    setTimeout(() => {
      this.historyState = history
      this.setView?.(newView)
    }, duration)

    setTimeout(() => {
      this.viewDirection = ''
    }, duration * 2)
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
