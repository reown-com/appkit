import { describe, it, expect } from 'vitest'
import { UiHelperUtil } from '../src/utils/UiHelperUtil'
import { ConstantsUtil } from '../src/utils/ConstantsUtil'

const convertToPixels = value => `${value}px`
const convertToGrid = value => `repeat(${value}, 1fr)`
const convertToGridPlacement = value => value.join('/')
const convertToSpacingPixels = value => value.map(v => `${v}px`).join(' ')

describe('UiHelperUtil', () => {
  it('should correctly handle MAX_WIDTH', () => {
    expect(UiHelperUtil.getBreakPointStyle('2XL', 'MAX_WIDTH')).toBe(
      convertToPixels(ConstantsUtil.BREAKPOINTS['2XL'].MAX_WIDTH)
    )
    expect(UiHelperUtil.getBreakPointStyle('XL', 'MAX_WIDTH')).toBe(
      convertToPixels(ConstantsUtil.BREAKPOINTS['XL'].MAX_WIDTH)
    )
    expect(UiHelperUtil.getBreakPointStyle('LG', 'MAX_WIDTH')).toBe(
      convertToPixels(ConstantsUtil.BREAKPOINTS['LG'].MAX_WIDTH)
    )
    expect(UiHelperUtil.getBreakPointStyle('MD', 'MAX_WIDTH')).toBe(
      convertToPixels(ConstantsUtil.BREAKPOINTS['MD'].MAX_WIDTH)
    )
    expect(UiHelperUtil.getBreakPointStyle('SM', 'MAX_WIDTH')).toBe(
      convertToPixels(ConstantsUtil.BREAKPOINTS['SM'].MAX_WIDTH)
    )
    expect(UiHelperUtil.getBreakPointStyle('XS', 'MAX_WIDTH')).toBe(
      convertToPixels(ConstantsUtil.BREAKPOINTS['XS'].MAX_WIDTH)
    )
  })

  it('should correctly handle GRID_COLUMNS', () => {
    expect(UiHelperUtil.getBreakPointStyle('2XL', 'GRID_COLUMNS')).toBe(
      convertToGrid(ConstantsUtil.BREAKPOINTS['2XL'].GRID_COLUMNS)
    )
    expect(UiHelperUtil.getBreakPointStyle('XL', 'GRID_COLUMNS')).toBe(
      convertToGrid(ConstantsUtil.BREAKPOINTS['XL'].GRID_COLUMNS)
    )
    expect(UiHelperUtil.getBreakPointStyle('LG', 'GRID_COLUMNS')).toBe(
      convertToGrid(ConstantsUtil.BREAKPOINTS['LG'].GRID_COLUMNS)
    )
    expect(UiHelperUtil.getBreakPointStyle('MD', 'GRID_COLUMNS')).toBe(
      convertToGrid(ConstantsUtil.BREAKPOINTS['MD'].GRID_COLUMNS)
    )
    expect(UiHelperUtil.getBreakPointStyle('SM', 'GRID_COLUMNS')).toBe(
      convertToGrid(ConstantsUtil.BREAKPOINTS['SM'].GRID_COLUMNS)
    )
    expect(UiHelperUtil.getBreakPointStyle('XS', 'GRID_COLUMNS')).toBe(
      convertToGrid(ConstantsUtil.BREAKPOINTS['XS'].GRID_COLUMNS)
    )
  })

  it('should correctly handle GRID_ROWS', () => {
    expect(UiHelperUtil.getBreakPointStyle('2XL', 'GRID_ROWS')).toBe(
      convertToGrid(ConstantsUtil.BREAKPOINTS['2XL'].GRID_ROWS)
    )
    expect(UiHelperUtil.getBreakPointStyle('XL', 'GRID_ROWS')).toBe(
      convertToGrid(ConstantsUtil.BREAKPOINTS['XL'].GRID_ROWS)
    )
    expect(UiHelperUtil.getBreakPointStyle('LG', 'GRID_ROWS')).toBe(
      convertToGrid(ConstantsUtil.BREAKPOINTS['LG'].GRID_ROWS)
    )
    expect(UiHelperUtil.getBreakPointStyle('MD', 'GRID_ROWS')).toBe(
      convertToGrid(ConstantsUtil.BREAKPOINTS['MD'].GRID_ROWS)
    )
    expect(UiHelperUtil.getBreakPointStyle('SM', 'GRID_ROWS')).toBe(
      convertToGrid(ConstantsUtil.BREAKPOINTS['SM'].GRID_ROWS)
    )
    expect(UiHelperUtil.getBreakPointStyle('XS', 'GRID_ROWS')).toBe(
      convertToGrid(ConstantsUtil.BREAKPOINTS['XS'].GRID_ROWS)
    )
  })

  it('should correctly handle MARGIN', () => {
    expect(UiHelperUtil.getBreakPointStyle('2XL', 'MARGIN')).toBe(
      convertToPixels(ConstantsUtil.BREAKPOINTS['2XL'].MARGIN)
    )
    expect(UiHelperUtil.getBreakPointStyle('XL', 'MARGIN')).toBe(
      convertToPixels(ConstantsUtil.BREAKPOINTS['XL'].MARGIN)
    )
    expect(UiHelperUtil.getBreakPointStyle('LG', 'MARGIN')).toBe(
      convertToPixels(ConstantsUtil.BREAKPOINTS['LG'].MARGIN)
    )
    expect(UiHelperUtil.getBreakPointStyle('MD', 'MARGIN')).toBe(
      convertToPixels(ConstantsUtil.BREAKPOINTS['MD'].MARGIN)
    )
    expect(UiHelperUtil.getBreakPointStyle('SM', 'MARGIN')).toBe(
      convertToPixels(ConstantsUtil.BREAKPOINTS['SM'].MARGIN)
    )
    expect(UiHelperUtil.getBreakPointStyle('XS', 'MARGIN')).toBe(
      convertToPixels(ConstantsUtil.BREAKPOINTS['XS'].MARGIN)
    )
  })

  it('should correctly handle GUTTER', () => {
    expect(UiHelperUtil.getBreakPointStyle('2XL', 'GUTTER')).toBe(
      convertToGridGutter(ConstantsUtil.BREAKPOINTS['2XL'].GUTTER)
        .map(v => `${v}px`)
        .join(' ')
    )
    expect(UiHelperUtil.getBreakPointStyle('XL', 'GUTTER')).toBe(
      ConstantsUtil.BREAKPOINTS['XL'].GUTTER.map(v => `${v}px`).join(' ')
    )
    expect(UiHelperUtil.getBreakPointStyle('LG', 'GUTTER')).toBe(
      ConstantsUtil.BREAKPOINTS['LG'].GUTTER.map(v => `${v}px`).join(' ')
    )
    expect(UiHelperUtil.getBreakPointStyle('MD', 'GUTTER')).toBe(
      ConstantsUtil.BREAKPOINTS['MD'].GUTTER.map(v => `${v}px`).join(' ')
    )
    expect(UiHelperUtil.getBreakPointStyle('SM', 'GUTTER')).toBe(
      ConstantsUtil.BREAKPOINTS['SM'].GUTTER.map(v => `${v}px`).join(' ')
    )
    expect(UiHelperUtil.getBreakPointStyle('XS', 'GUTTER')).toBe(
      ConstantsUtil.BREAKPOINTS['XS'].GUTTER.map(v => `${v}px`).join(' ')
    )
  })

  it('should correctly handle MODAL_GRID_COLUMN_PLACEMENT', () => {
    expect(UiHelperUtil.getBreakPointStyle('2XL', 'MODAL_GRID_COLUMN_PLACEMENT')).toBe(
      convertToGridPlacement(ConstantsUtil.BREAKPOINTS['2XL'].MODAL_GRID_COLUMN_PLACEMENT)
    )
    expect(UiHelperUtil.getBreakPointStyle('XL', 'MODAL_GRID_COLUMN_PLACEMENT')).toBe(
      convertToGridPlacement(ConstantsUtil.BREAKPOINTS['XL'].MODAL_GRID_COLUMN_PLACEMENT)
    )
    expect(UiHelperUtil.getBreakPointStyle('LG', 'MODAL_GRID_COLUMN_PLACEMENT')).toBe(
      convertToGridPlacement(ConstantsUtil.BREAKPOINTS['LG'].MODAL_GRID_COLUMN_PLACEMENT)
    )
    expect(UiHelperUtil.getBreakPointStyle('MD', 'MODAL_GRID_COLUMN_PLACEMENT')).toBe(
      convertToGridPlacement(ConstantsUtil.BREAKPOINTS['MD'].MODAL_GRID_COLUMN_PLACEMENT)
    )
    expect(UiHelperUtil.getBreakPointStyle('SM', 'MODAL_GRID_COLUMN_PLACEMENT')).toBe(
      convertToGridPlacement(ConstantsUtil.BREAKPOINTS['SM'].MODAL_GRID_COLUMN_PLACEMENT)
    )
    expect(UiHelperUtil.getBreakPointStyle('XS', 'MODAL_GRID_COLUMN_PLACEMENT')).toBe(
      convertToGridPlacement(ConstantsUtil.BREAKPOINTS['XS'].MODAL_GRID_COLUMN_PLACEMENT)
    )
  })

  it('should correctly handle MODAL_GRID_ROW_PLACEMENT', () => {
    expect(UiHelperUtil.getBreakPointStyle('2XL', 'MODAL_GRID_ROW_PLACEMENT')).toBe(
      convertToSpacingPixels(ConstantsUtil.BREAKPOINTS['2XL'].MODAL_GRID_ROW_PLACEMENT)
    )
    expect(UiHelperUtil.getBreakPointStyle('XL', 'MODAL_GRID_ROW_PLACEMENT')).toBe(
      convertToSpacingPixels(ConstantsUtil.BREAKPOINTS['XL'].MODAL_GRID_ROW_PLACEMENT)
    )
    expect(UiHelperUtil.getBreakPointStyle('LG', 'MODAL_GRID_ROW_PLACEMENT')).toBe(
      convertToSpacingPixels(ConstantsUtil.BREAKPOINTS['LG'].MODAL_GRID_ROW_PLACEMENT)
    )
    expect(UiHelperUtil.getBreakPointStyle('MD', 'MODAL_GRID_ROW_PLACEMENT')).toBe(
      convertToSpacingPixels(ConstantsUtil.BREAKPOINTS['MD'].MODAL_GRID_ROW_PLACEMENT)
    )
    expect(UiHelperUtil.getBreakPointStyle('SM', 'MODAL_GRID_ROW_PLACEMENT')).toBe(
      convertToSpacingPixels(ConstantsUtil.BREAKPOINTS['SM'].MODAL_GRID_ROW_PLACEMENT)
    )
    expect(UiHelperUtil.getBreakPointStyle('XS', 'MODAL_GRID_ROW_PLACEMENT')).toBe(
      convertToSpacingPixels(ConstantsUtil.BREAKPOINTS['XS'].MODAL_GRID_ROW_PLACEMENT)
    )
  })
})
