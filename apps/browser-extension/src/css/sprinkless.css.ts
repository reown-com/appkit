import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles'
import { dimensions, flexAlignments, radii, spacing, textAlignments, themeValues } from './vars'

const unresponsiveProperties = defineProperties({
  properties: {
    alignSelf: flexAlignments,
    backgroundSize: ['cover'] as const,
    flex: ['1', '0.5'],
    opacity: ['1', '0.7', '0.5'],
    borderRadius: radii,
    backgroundClip: ['text'],
    WebkitBackgroundClip: ['text'],
    WebkitTextFillColor: ['transparent'],
    display: ['block', 'flex', 'none'],
    alignItems: [...flexAlignments, 'baseline'],
    willChange: ['transform'],
    borderStyle: {
      solid: 'solid'
    },
    borderWidth: {
      '0': '0px',
      '1': '1px',
      '2': '2px',
      '4': '4px'
    },
    cursor: ['pointer', 'none'],
    pointerEvents: ['none', 'all'],
    minHeight: {
      ...dimensions,
      full: '100vh'
    },
    flexDirection: ['row', 'column'],
    fontSize: {
      '12': { fontSize: '12px', lineHeight: '18px' },
      '13': { fontSize: '13px', lineHeight: '18px' },
      '14': { fontSize: '14px', lineHeight: '18px' },
      '16': { fontSize: '16px', lineHeight: '20px' },
      '18': { fontSize: '18px', lineHeight: '24px' },
      '20': { fontSize: '20px', lineHeight: '24px' },
      '23': { fontSize: '23px', lineHeight: '29px' },
      '40': { fontSize: '40px', lineHeight: '62px' },
      '120': { fontSize: '120px', lineHeight: '144px' }
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      heavy: '800'
    },
    flexWrap: ['wrap'],
    gap: spacing,
    height: dimensions,
    justifyContent: [...flexAlignments, 'space-between', 'space-around'],
    textAlign: textAlignments,
    marginBottom: spacing,
    marginLeft: { ...spacing, auto: 'auto' },
    marginRight: spacing,
    marginTop: spacing,
    maxWidth: dimensions,
    minWidth: dimensions,
    overflow: ['hidden'] as const,
    paddingBottom: spacing,
    paddingLeft: spacing,
    paddingRight: spacing,
    paddingTop: spacing,
    position: ['absolute', 'fixed', 'relative'],
    WebkitUserSelect: ['none'],
    border: ['none'],
    outlineWidth: ['0'],
    right: {
      '0': '0'
    },
    transition: {
      default: '0.125s ease',
      transform: 'transform 0.125s ease'
    },
    userSelect: ['none', 'auto'] as const,
    width: dimensions
  } as const,
  shorthands: {
    margin: ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'],
    marginX: ['marginLeft', 'marginRight'],
    marginY: ['marginTop', 'marginBottom'],
    padding: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
    paddingX: ['paddingLeft', 'paddingRight'],
    paddingY: ['paddingTop', 'paddingBottom']
  }
})

const colorProperties = defineProperties({
  conditions: {
    base: {},
    hover: { selector: '&:hover' },
    active: { selector: '&:active' }
  },
  defaultCondition: 'base',
  properties: {
    background: themeValues.colors,
    borderColor: themeValues.colors,
    boxShadow: themeValues.shadows,
    color: themeValues.colors
  }
})

export const sprinkles = createSprinkles(colorProperties, unresponsiveProperties)

export type Sprinkles = Parameters<typeof sprinkles>[0]
