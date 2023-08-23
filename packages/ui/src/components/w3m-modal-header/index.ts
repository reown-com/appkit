import { RouterCtrl } from '@web3modal/core'
import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-modal-header')
export class W3mModalHeader extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public title = ''

  @property() public onAction?: () => void = undefined

  @property() public actionIcon?: TemplateResult<2> = undefined

  @property() public border = false

  // -- private ------------------------------------------------------ //
  private backBtnTemplate() {
    return html`
      <button
        class="w3m-back-btn"
        data-testid="component-header-back-button"
        @click=${RouterCtrl.goBack}
      >
        ${SvgUtil.BACK_ICON}
      </button>
    `
  }

  private actionBtnTemplate() {
    return html`<button
      class="w3m-action-btn"
      data-testid="component-header-action-button"
      @click=${this.onAction}
    >
      ${this.actionIcon}
    </button>`
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-border': this.border
    }
    const backBtn = RouterCtrl.state.history.length > 1

    const content = this.title
      ? html`<w3m-text variant="big-bold">${this.title}</w3m-text>`
      : html`<slot></slot>`

    return html`
      <header class=${classMap(classes)}>
        ${backBtn ? this.backBtnTemplate() : null} ${content}
        ${this.onAction ? this.actionBtnTemplate() : null}
      </header>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-header': W3mModalHeader
  }
}
