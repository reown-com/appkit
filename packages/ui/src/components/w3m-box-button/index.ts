import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-box-button')
export class W3mBoxButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public icon?: TemplateResult<2> = undefined

  @property() public label = ''

  @property() public loading?: boolean = false

  @property() public onClick: () => void = () => null

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <button
        data-testid="component-button-box"
        @click=${this.onClick}
        .disabled="${Boolean(this.loading)}"
      >
        <div>
          ${this.loading
            ? html`<w3m-spinner size=${20} color="fill"></w3m-spinner>`
            : html`${this.icon}`}
        </div>
        <w3m-text variant="xsmall-regular" color="accent">${this.label}</w3m-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-box-button': W3mBoxButton
  }
}
