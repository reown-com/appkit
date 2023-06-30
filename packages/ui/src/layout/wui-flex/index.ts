import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import styles from './styles'
import type {
  Spacing,
  FlexDirection,
  FlexWrap,
  FlexBasis,
  FlexShrink,
  FlexGrow,
  AlignItems,
  JustifyContent
} from '../../utils/TypesUtil'

@customElement('wui-flex')
export class WuiFlex extends LitElement {
  public static styles = [styles]

  @property() public flexDirection?: FlexDirection

  @property() public flexWrap?: FlexWrap

  @property() public flexBasis?: FlexBasis

  @property() public flexGrow?: FlexGrow

  @property() public flexShrink?: FlexShrink

  @property() public alignItems?: AlignItems

  @property() public justifyContent?: JustifyContent

  @property() public columnGap?: Spacing

  @property() public rowGap?: Spacing

  @property() public gap?: Spacing

  public render() {
    const inlineStyles = {
      flexDirection: this.flexDirection,
      flexWrap: this.flexWrap,
      flexBasis: this.flexBasis,
      flexGrow: this.flexGrow,
      flexShrink: this.flexShrink,
      alignItems: this.alignItems,
      justifyContent: this.justifyContent,
      columnGap: this.columnGap && `var(--wui-spacing-${this.columnGap})`,
      rowGap: this.rowGap && `var(--wui-spacing-${this.rowGap})`,
      gap: this.gap && `var(--wui-spacing-${this.gap})`
    }

    return html`<div style="${styleMap(inlineStyles)}"><slot></slot></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-flex': WuiFlex
  }
}
