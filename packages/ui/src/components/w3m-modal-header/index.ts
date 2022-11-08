import { RouterCtrl } from '@web3modal/core'
import type { TemplateResult } from 'lit'
import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { scss } from '../../style/utils'
import { BACK_ICON } from '../../utils/Svgs'
import { global, color } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import '../w3m-spinner'
import '../w3m-text'
import styles from './styles.css'

@customElement('w3m-modal-header')
export class W3mModalHeader extends ThemedElement {
  public static styles = [global, styles]

  protected dynamicStyles() {
    const { foreground, background } = color()

    return html`<style>
      .w3m-modal-header {
        border-bottom: 1px solid ${background[2]};
      }

      .w3m-back-btn path,
      .w3m-action-btn path {
        fill: ${foreground.accent};
      }
    </style>`
  }

  // -- state & properties ------------------------------------------- //
  @property() public title = ''
  @property() public onAction?: () => void = undefined
  @property() public actionIcon?: TemplateResult<2> = undefined

  // -- private ------------------------------------------------------ //
  private backBtnTemplate() {
    return html`<button class="w3m-back-btn" @click=${RouterCtrl.goBack}>${BACK_ICON}</button>`
  }

  private actionBtnTemplate() {
    return html`<button class="w3m-action-btn" @click=${this.onAction}>${this.actionIcon}</button>`
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const backBtn = RouterCtrl.state.history.length > 1

    const content = this.title
      ? html`<w3m-text variant="large-bold">${this.title}</w3m-text>`
      : html`<slot></slot>`

    return html`
      ${this.dynamicStyles()}

      <div class="w3m-modal-header">
        ${backBtn ? this.backBtnTemplate() : null} ${content}
        ${this.onAction ? this.actionBtnTemplate() : null}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-header': W3mModalHeader
  }
}
