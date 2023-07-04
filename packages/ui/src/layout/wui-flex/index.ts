import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import styles from './styles'
import type {
  SpacingType,
  FlexDirectionType,
  FlexWrapType,
  FlexBasisType,
  FlexShrinkType,
  FlexGrowType,
  FlexAlignItemsType,
  FlexJustifyContentType
} from '../../utils/TypesUtil'
import { getSpacingStyles } from '../../utils/HelperUtils'

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

  @property() public padding?: SpacingType | SpacingType[]

  @property() public margin?: SpacingType | SpacingType[]

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
    'wui-flex': WuiFlex
  }
}
