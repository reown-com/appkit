import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { SocialsIconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../../components/wui-icon/index.js'
import styles from './styles.js'

@customElement('wui-social-button')
export class WuiSocialButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public icon: SocialsIconType = 'google'

  @property() public name = ''

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled} ontouchstart>
        <wui-icon size="xl" color="inverse" name=${this.icon}></wui-icon>
        ${this.templateName()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private templateName() {
    if (this.name) {
      return html`<wui-text variant="lg-regular" color="secondary">${this.name}</wui-text>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-social-button': WuiSocialButton
  }
}
