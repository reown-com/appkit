import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import styles from './styles.js'

@customElement('wui-overlay')
export class WuiOverlay extends LitElement {
  public static override styles = [resetStyles, styles]

  public constructor() {
    super()
    window.addEventListener('resize', () => this.handleResize())
  }

  public handleResize() {
    const slot = this.shadowRoot?.querySelector('slot')
    if (slot) {
      const assignedNodes = slot.assignedNodes()
      assignedNodes.forEach(node => {
        if (node instanceof Element) {
          if (node.nodeName === 'WUI-CARD') {
            if (node.scrollHeight > window.innerHeight) {
              this.setAttribute('data-top', 'true')
            } else {
              this.setAttribute('data-top', 'false')
            }
          }
        }
      })
    }
  }

  // -- Render -------------------------------------------- //

  public override render() {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-overlay': WuiOverlay
  }
}
