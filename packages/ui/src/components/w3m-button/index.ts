import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-button')
export class W3mButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public disabled? = false

  @property() public iconLeft?: TemplateResult<2> = undefined

  @property() public iconRight?: TemplateResult<2> = undefined

  @property() public onClick: () => void = () => null

  @property() public variant: 'default' | 'ghost' | 'outline' = 'default'

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-icon-left': this.iconLeft !== undefined,
      'w3m-icon-right': this.iconRight !== undefined,
      'w3m-ghost': this.variant === 'ghost',
      'w3m-outline': this.variant === 'outline'
    }
    let textColor = 'inverse'
    if (this.variant === 'ghost') {
      textColor = 'secondary'
    }
    if (this.variant === 'outline') {
      textColor = 'accent'
    }

    return html`
      <button
        class=${classMap(classes)}
        data-testid="component-button"
        ?disabled=${this.disabled}
        @click=${this.onClick}
      >
        ${this.iconLeft}
        <w3m-text variant="small-regular" color=${textColor}>
          <slot></slot>
        </w3m-text>
        ${this.iconRight}
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-button': W3mButton
  }
}
