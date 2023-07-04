import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { GridContentType, GridItemsType, SpacingType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-grid')
export class WuiGrid extends LitElement {
  public static styles = [styles]

  @property() public gridTemplateRows?: string

  @property() public gridTemplateColumns?: string

  @property() public justifyItems?: GridItemsType

  @property() public alignItems?: GridItemsType

  @property() public justifyContent?: GridContentType

  @property() public alignContent?: GridContentType

  @property() public columnGap?: SpacingType

  @property() public rowGap?: SpacingType

  @property() public gap?: SpacingType

  public render() {
    this.style.cssText = `
      grid-template-rows: ${this.gridTemplateRows};
      grid-template-columns: ${this.gridTemplateColumns};
      justify-items: ${this.justifyItems};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      align-content: ${this.alignContent};
      column-gap: ${this.columnGap && `var(--wui-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap && `var(--wui-spacing-${this.rowGap})`};
      gap: ${this.gap && `var(--wui-spacing-${this.gap})`};
    `

    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-grid': WuiGrid
  }
}
