import { createVar, style, styleVariants } from '@vanilla-extract/css'
import { calc } from '@vanilla-extract/css-utils'

const hoverScaleValues = {
  grow: 1.025,
  growLg: 1.1
} as const

const activeScaleValues = {
  shrink: 0.95,
  shrinkSm: 0.9
} as const

const hoverScaleVar = createVar()
const activeScaleVar = createVar()

export const base = style({
  position: 'relative',
  selectors: {
    '&,&::after': {
      vars: {
        [hoverScaleVar]: '1',
        [activeScaleVar]: '1'
      }
    },
    '&:hover': {
      transform: `scale(${hoverScaleVar})`
    },
    '&:active': {
      transform: `scale(${activeScaleVar})`
    },
    '&:active::after': {
      bottom: -1,
      content: '""',
      display: 'block',
      left: -1,
      position: 'absolute',
      right: -1,
      top: -1,
      transform: `scale(${calc(1).divide(activeScaleVar).multiply(hoverScaleVar).toString()})`
    }
  }
})

export const hover = styleVariants(hoverScaleValues, scale => ({
  selectors: {
    '&,&::after': {
      vars: { [hoverScaleVar]: String(scale) }
    }
  }
}))

export const active = styleVariants(activeScaleValues, scale => ({
  selectors: {
    '&,&::after': {
      vars: { [activeScaleVar]: String(scale) }
    }
  }
}))
