import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

const MAX_HEIGHT = 100

@customElement('wui-list-accordion')
export class WuiListAccordion extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public textTitle = ''
  @property() public overflowedContent = ''

  public toggled = false
  public enableAccordion = false
  public scrollElement?: Element = undefined
  public scrollHeightElement = 0

  public override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties)
    if (changedProperties.has('textTitle') || changedProperties.has('overflowedContent')) {
      setTimeout(() => {
        this.checkHeight()
      }, 1)
    }
  }

  private checkHeight() {
    this.updateComplete.then(() => {
      const heightElement = this.shadowRoot?.querySelector('.heightContent')
      const textElement = this.shadowRoot?.querySelector('.textContent')

      if (heightElement && textElement) {
        this.scrollElement = heightElement
        const scrollHeight = textElement?.scrollHeight

        if (scrollHeight && scrollHeight > MAX_HEIGHT) {
          this.enableAccordion = true
          this.scrollHeightElement = scrollHeight
          this.requestUpdate()
        }
      }
    })
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ontouchstart @click=${() => this.onClick()}>
        <wui-flex justifyContent="space-between" alignItems="center">
          <wui-text variant="paragraph-500" color="fg-100">${this.textTitle}</wui-text>
          ${this.chevronTemplate()}
        </wui-flex>
        <div
          data-active=${this.enableAccordion ? Boolean(this.toggled) : true}
          class="overflowedContent"
        >
          <div class="heightContent">
            <wui-text class="textContent" variant="paragraph-400" color="fg-200">
              <pre>${this.overflowedContent}</pre>
            </wui-text>
          </div>
        </div>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private onClick() {
    const icon = this.shadowRoot?.querySelector('wui-icon')
    if (this.enableAccordion) {
      this.toggled = !this.toggled
      this.requestUpdate()

      if (this.scrollElement) {
        this.scrollElement.animate(
          [
            { maxHeight: this.toggled ? `${MAX_HEIGHT}px` : `${this.scrollHeightElement}px` },
            { maxHeight: this.toggled ? `${this.scrollHeightElement}px` : `${MAX_HEIGHT}px` }
          ],
          {
            duration: 300,
            fill: 'forwards',
            easing: 'ease'
          }
        )
      }
      if (icon) {
        icon.animate(
          [
            { transform: this.toggled ? `rotate(0deg)` : `rotate(180deg)` },
            { transform: this.toggled ? `rotate(180deg)` : `rotate(0deg)` }
          ],
          {
            duration: 300,
            fill: 'forwards',
            easing: 'ease'
          }
        )
      }
    }
  }

  public chevronTemplate() {
    if (this.enableAccordion) {
      return html` <wui-icon color="fg-100" size="sm" name="chevronBottom"></wui-icon>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-accordion': WuiListAccordion
  }
}
