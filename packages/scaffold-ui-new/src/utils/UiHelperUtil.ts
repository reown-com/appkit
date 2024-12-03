import { ConstantsUtil } from './ConstantsUtil.js'

type BreakpointType = keyof typeof ConstantsUtil.BREAKPOINTS
type BreakpointPropertyType = keyof (typeof ConstantsUtil.BREAKPOINTS)[BreakpointType]

const BREAKPOINT_PROPERTY_CONVERTER = {
  MAX_WIDTH: (value: number) => `${value}px`,
  GRID_COLUMNS: (value: number) => `repeat(${value}, 1fr)`,
  GRID_ROWS: (value: number) => `repeat(${value}, 1fr)`,
  MARGIN: (value: number) => `${value}px`,
  GUTTER: (value: number[]) => value.map(v => `${v}px`).join(' '),
  MODAL_GRID_COLUMN_PLACEMENT: (value: number[]) => value.join('/'),
  MODAL_GRID_ROW_PLACEMENT: (value: number[]) => value.join('/')
}

export const UiHelperUtil = {
  getBreakPointStyle(breakpoint: BreakpointType, property: BreakpointPropertyType) {
    const value = ConstantsUtil.BREAKPOINTS[breakpoint][property]

    return BREAKPOINT_PROPERTY_CONVERTER[property](value as number & number[])
  }
}
