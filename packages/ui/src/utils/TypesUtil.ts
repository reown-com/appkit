export type Color =
  | 'blue-100'
  | 'error-100'
  | 'fg-100'
  | 'fg-200'
  | 'fg-300'
  | 'inherit'
  | 'inverse-000'
  | 'inverse-100'
  | 'success-100'

export type Size = 'inherit' | 'lg' | 'md' | 'sm' | 'xs' | 'xxs'

export type Spacing = '3xl' | '3xs' | '4xs' | 'l' | 'm' | 's' | 'xl' | 'xs' | 'xxl' | 'xxs'

export type BorderRadius = Exclude<Spacing, 'xl' | 'xxl'>

export type FlexDirection = 'column-reverse' | 'column' | 'row-reverse' | 'row'

export type FlexWrap = 'nowrap' | 'wrap-reverse' | 'wrap'

export type FlexBasis = 'auto' | 'content' | 'fit-content' | 'max-content' | 'min-content'

export type FlexGrow = '0' | '1'

export type FlexShrink = '0' | '1'

export type AlignItems = 'baseline' | 'center' | 'flex-end' | 'flex-start' | 'stretch'

export type JustifyContent =
  | 'center'
  | 'flex-end'
  | 'flex-start'
  | 'space-around'
  | 'space-between'
  | 'space-evenly'
