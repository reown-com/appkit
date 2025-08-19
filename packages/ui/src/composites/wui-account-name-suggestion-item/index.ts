import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import '../../composites/wui-tag/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-account-name-suggestion-item')
export class WuiAccountNameSuggestionItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public name = ''

  @property({ type: Boolean }) public registered = false

  @property({ type: Boolean }) public loading = false

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled}>
        <wui-text class="name" color="primary" variant="md-regular">${this.name}</wui-text>
        ${this.templateRightContent()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private templateRightContent() {
    if (this.loading) {
      return html`<wui-loading-spinner size="lg" color="primary"></wui-loading-spinner>`
    }

    return this.registered
      ? html`<wui-tag variant="info" size="sm">Registered</wui-tag>`
      : html`<wui-tag variant="success" size="sm">Available</wui-tag>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-account-name-suggestion-item': WuiAccountNameSuggestionItem
  }
}
