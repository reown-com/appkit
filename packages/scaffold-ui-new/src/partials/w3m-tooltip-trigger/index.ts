import { html, LitElement } from 'lit'
import { property, state } from 'lit/decorators.js'
import { customElement } from '@reown/appkit-ui'
import styles from './styles.js'
import { ModalController, RouterController, TooltipController } from '@reown/appkit-core'

@customElement('w3m-tooltip-trigger')
export class WuiTooltipTrigger extends LitElement {
  public static override styles = [styles]

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() text = ''

  @state() open = TooltipController.state.open

  public constructor() {
    super()
    this.unsubscribe.push(
      RouterController.subscribeKey('view', () => {
        TooltipController.hide()
      }),
      ModalController.subscribeKey('open', modalOpen => {
        if (!modalOpen) {
          TooltipController.hide()
        }
      }),
      TooltipController.subscribeKey('open', tooltipOpen => {
        this.open = tooltipOpen
      })
    )
  }

  // -- Lifecycle ----------------------------------------- //
  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    TooltipController.hide()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <div
        @pointermove=${this.onMouseEnter.bind(this)}
        @pointerleave=${this.onMouseLeave.bind(this)}
      >
        ${this.renderChildren()}
      </div>
    `
  }

  private renderChildren() {
    return html`<slot></slot> `
  }

  // -- Private ------------------------------------------- //
  private onMouseEnter() {
    const rect = this.getBoundingClientRect()
    if (!this.open) {
      TooltipController.showTooltip({
        message: this.text,
        triggerRect: {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top
        },
        variant: 'shade'
      })
    }
  }

  private onMouseLeave(event: MouseEvent) {
    if (!this.contains(event.relatedTarget as Node)) {
      TooltipController.hide()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-tooltip-trigger': WuiTooltipTrigger
  }
}
