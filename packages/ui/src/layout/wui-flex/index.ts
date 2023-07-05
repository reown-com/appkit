import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { getSpacingStyles } from '../../utils/HelperUtils'
import { resetStyles } from '../../utils/ThemeUtil'
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
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
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

  @property() public padding?: SpacingType | SpacingType[]

  @property() public margin?: SpacingType | SpacingType[]

  // -- Render -------------------------------------------- //
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
      padding-top: ${this.padding && getSpacingStyles(this.padding, 0)};
      padding-right: ${this.padding && getSpacingStyles(this.padding, 1)};
      padding-bottom: ${this.padding && getSpacingStyles(this.padding, 2)};
      padding-left: ${this.padding && getSpacingStyles(this.padding, 3)};
      margin-top: ${this.margin && getSpacingStyles(this.margin, 0)};
      margin-right: ${this.margin && getSpacingStyles(this.margin, 1)};
      margin-bottom: ${this.margin && getSpacingStyles(this.margin, 2)};
      margin-left: ${this.margin && getSpacingStyles(this.margin, 3)};
    `

    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-flex': WuiFlex
  }
}
