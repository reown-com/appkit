import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { TooltipController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-tooltip')
@customElement('w3m-tooltip')
export class W3mTooltip extends LitElement {
  public static override styles = [styles]

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private open = TooltipController.state.open

  @state() private message = TooltipController.state.message

  @state() private triggerRect = TooltipController.state.triggerRect

  @state() private variant = TooltipController.state.variant

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        TooltipController.subscribe(newState => {
          this.open = newState.open
          this.message = newState.message
          this.triggerRect = newState.triggerRect
          this.variant = newState.variant
        })
      ]
    )
  }

  // -- Lifecycle ----------------------------------------- //
  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['variant'] = this.variant

    const topValue = this.triggerRect.top
    const leftValue = this.triggerRect.left

    this.style.cssText = `
    --w3m-tooltip-top: ${topValue}px;
    --w3m-tooltip-left: ${leftValue}px;
    --w3m-tooltip-parent-width: ${this.triggerRect.width / 2}px;
    --w3m-tooltip-display: ${this.open ? 'flex' : 'none'};
    --w3m-tooltip-opacity: ${this.open ? 1 : 0};
    `

    return html`<wui-flex>
      <wui-icon data-placement="top" color="fg-100" size="inherit" name="cursor"></wui-icon>
      <wui-text color="inherit" variant="small-500">${this.message}</wui-text>
    </wui-flex>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-tooltip': W3mTooltip
  }
}
