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
