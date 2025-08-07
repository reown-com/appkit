import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import { UiHelperUtil, customElement } from '@reown/appkit-ui'

import styles from './styles.js'

@customElement('w3m-router-container')
export class W3mRouterContainer extends LitElement {
  static override styles = [styles]

  // -- State & Properties -------------------------------- //
  private resizeObserver?: ResizeObserver = undefined

  @property({ type: String }) transitionDuration = '0.15s'

  @property({ type: String }) transitionFunction = ''

  @property({ type: String }) history = ''

  @property({ type: String }) view: string | undefined = ''

  @property({ attribute: false }) setView: ((view: string) => void) | undefined = undefined

  @state() private viewDirection = ''

  @state() private historyState = ''

  @state() private previousHeight = '0px'

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
    if (this.transitionFunction) {
      this.style.setProperty('--local-transition', this.transitionFunction)
    }
    this.style.setProperty('--local-duration', this.transitionDuration)
    this.historyState = this.history

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === this.getWrapper()) {
          let newHeight = entry.contentRect.height
          const footerHeight = parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--apkt-footer-height') ||
              '0'
          )
          const totalHeight = newHeight + footerHeight
          newHeight = totalHeight
          this.style.setProperty(
            '--local-border-bottom-radius',
            footerHeight ? 'var(--apkt-borderRadius-5)' : '0px'
          )

          this.style.setProperty('--local-container-height', `${newHeight}px`)
          if (this.previousHeight !== '0px') {
            this.style.setProperty('--local-duration-height', this.transitionDuration)
          }
          this.previousHeight = `${newHeight}px`
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

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <div class="container">
        <div class="page" view-direction="${this.viewDirection}">
          <div class="page-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `
  }

  // -- Private ------------------------------------------- //
  private onViewChange(history: string) {
    const historyArr = history.split(',').filter(Boolean)
    const prevArr = this.historyState.split(',').filter(Boolean)

    const prevLength = prevArr.length
    const newLength = historyArr.length
    const newView = historyArr[historyArr.length - 1] || ''
    const duration = UiHelperUtil.cssDurationToNumber(this.transitionDuration)

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
    'w3m-router-container': W3mRouterContainer
  }
}
