import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import styles from './styles'
import type { SpacingType, GridContentType, GridItemsType } from '../../utils/TypesUtil'
import { getSpacingStyles } from '../../utils/HelperUtils'

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

  @property() public padding?: SpacingType | SpacingType[]

  @property() public margin?: SpacingType | SpacingType[]

  public render() {
    const inlineStyles = {
      gridTemplateRows: this.gridTemplateRows,
      gridTemplateColumns: this.gridTemplateColumns,
      justifyItems: this.justifyItems,
      alignItems: this.alignItems,
      justifyContent: this.justifyContent,
      alignContent: this.alignContent,
      columnGap: this.columnGap && `var(--wui-spacing-${this.columnGap})`,
      rowGap: this.rowGap && `var(--wui-spacing-${this.rowGap})`,
      gap: this.gap && `var(--wui-spacing-${this.gap})`,
      paddingTop: this.padding && getSpacingStyles(this.padding, 0),
      paddingRight: this.padding && getSpacingStyles(this.padding, 1),
      paddingBottom: this.padding && getSpacingStyles(this.padding, 2),
      paddingLeft: this.padding && getSpacingStyles(this.padding, 3),
      marginTop: this.margin && getSpacingStyles(this.margin, 0),
      marginRight: this.margin && getSpacingStyles(this.margin, 1),
      marginBottom: this.margin && getSpacingStyles(this.margin, 2),
      marginLeft: this.margin && getSpacingStyles(this.margin, 3)
    }

    return html`<div style="${styleMap(inlineStyles)}"><slot></slot></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-grid': WuiGrid
  }
}
