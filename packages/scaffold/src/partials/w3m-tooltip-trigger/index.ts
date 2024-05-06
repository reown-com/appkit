import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '@web3modal/ui'
import styles from './styles.js'
import { TooltipController } from '@web3modal/core'

@customElement('w3m-tooltip-trigger')
export class WuiTooltipTrigger extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property() text = ''

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
