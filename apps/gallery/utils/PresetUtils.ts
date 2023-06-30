import type {
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
