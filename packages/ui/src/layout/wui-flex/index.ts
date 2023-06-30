import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import styles from './styles'
import type { Color, BorderRadius, Spacing } from '../../utils/TypesUtil'

@customElement('wui-flex')
export class WuiFlex extends LitElement {
  public static styles = [styles]

  @property() public backgroundColor?: Color

  @property() public borderRadius?: BorderRadius

  @property() public flexDirection?: string

  @property() public flexWrap?: string

  @property() public flexBasis?: string

  @property() public flexGrow?: string

  @property() public flexShrink?: string

  @property() public alignItems?: string

  @property() public justifyContent?: string

  @property() public columnGap?: Spacing

  @property() public rowGap?: Spacing

  @property() public gap?: Spacing

  @property() public width?: string

  @property() public height?: string

  @property() public padding?: string

  public render() {
    const inlineStyles = {
      backgroundColor: this.backgroundColor && `var(--wui-color-${this.backgroundColor})`,
      borderRadius: this.borderRadius && `var(--wui-border-radius-${this.borderRadius})`,
      flexDirection: this.flexDirection,
      flexWrap: this.flexWrap,
      flexBasis: this.flexBasis,
      flexGrow: this.flexGrow,
      flexShrink: this.flexShrink,
      alignItems: this.alignItems,
      justifyContent: this.justifyContent,
      columnGap: this.columnGap && `var(--wui-spacing-${this.columnGap})`,
      rowGap: this.rowGap && `var(--wui-spacing-${this.rowGap})`,
      gap: this.gap && `var(--wui-spacing-${this.gap})`,
      padding: this.padding && `var(--wui-spacing-${this.padding})`,
      width: this.width,
      height: this.height
    }

    return html`<div style="${styleMap(inlineStyles)}"><slot></slot></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-flex': WuiFlex
  }
}
