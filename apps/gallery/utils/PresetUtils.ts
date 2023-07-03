import type {
  TextType,
  ColorType,
  FlexDirectionType,
  FlexWrapType,
  FlexBasisType,
  FlexGrowType,
  FlexShrinkType,
  AlignItemsType,
  JustifyContentType,
  BorderRadiusType,
  SpacingType
} from '@web3modal/ui/src/utils/TypesUtil'

export const colorOptions: ColorType[] = [
  'blue-100',
  'error-100',
  'fg-100',
  'fg-200',
  'fg-300',
  'inherit',
  'inverse-000',
  'inverse-100',
  'success-100'
]

export const textOptions: TextType[] = [
  'micro-500',
  'micro-600',
  'tiny-500',
  'tiny-600',
  'small-500',
  'small-600',
  'paragraph-500',
  'paragraph-600',
  'paragraph-700',
  'large-500',
  'large-600',
  'large-700'
]

export const flexDirectionOptions: FlexDirectionType[] = [
  'column-reverse',
  'column',
  'row-reverse',
  'row'
]

export const flexWrapOptions: FlexWrapType[] = ['nowrap', 'wrap-reverse', 'wrap']

export const flexBasisOptions: FlexBasisType[] = [
  'auto',
  'content',
  'fit-content',
  'max-content',
  'min-content'
]

export const flexGrowOptions: FlexGrowType[] = ['0', '1']

export const flexShrinkOptions: FlexShrinkType[] = ['0', '1']

export const alignItemsOptions: AlignItemsType[] = [
  'baseline',
  'center',
  'flex-end',
  'flex-start',
  'stretch'
]

export const justifyContentOptions: JustifyContentType[] = [
  'center',
  'flex-end',
  'flex-start',
  'space-around',
  'space-between',
  'space-evenly'
]

export const borderRadiusOptions: BorderRadiusType[] = ['3xs', '4xs', 'l', 'm', 's', 'xxs']

export const spacingOptions: SpacingType[] = [
  '3xl',
  '3xs',
  '4xs',
  'l',
  'm',
  's',
  'xl',
  'xs',
  'xxl',
  'xxs'
]
