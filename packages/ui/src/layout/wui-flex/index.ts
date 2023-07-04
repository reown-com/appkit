import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type {
  FlexAlignItemsType,
  FlexBasisType,
  FlexDirectionType,
  FlexGrowType,
  FlexJustifyContentType,
  FlexShrinkType,
  FlexWrapType,
  SpacingType
} from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-flex')
export class WuiFlex extends LitElement {
  public static styles = [styles]

  @property() public flexDirection?: FlexDirectionType

  @property() public flexWrap?: FlexWrapType

  @property() public flexBasis?: FlexBasisType

  @property() public flexGrow?: FlexGrowType

  @property() public flexShrink?: FlexShrinkType

  @property() public alignItems?: FlexAlignItemsType

  @property() public justifyContent?: FlexJustifyContentType

  @property() public columnGap?: SpacingType

  @property() public rowGap?: SpacingType

  @property() public gap?: SpacingType

  public render() {
    this.style.cssText = `
      flex-direction: ${this.flexDirection};
      flex-wrap: ${this.flexWrap};
      flex-basis: ${this.flexBasis};
      flex-grow: ${this.flexGrow};
      flex-shrink: ${this.flexShrink};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      column-gap: ${this.columnGap && `var(--wui-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap && `var(--wui-spacing-${this.rowGap})`};
      gap: ${this.gap && `var(--wui-spacing-${this.gap})`};
    `

    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-flex': WuiFlex
  }
}
