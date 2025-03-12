import { describe, expect, it } from 'vitest'

import { TooltipController } from '../../exports/index.js'

// -- Constants ----------------------------------------------------------------
const mockTriggerRect = {
  width: 100,
  height: 100,
  top: 100,
  left: 100
}

const mockTooltip = {
  message: 'Hello, World!',
  triggerRect: mockTriggerRect,
  variant: 'shade' as 'shade' | 'fill'
}

// -- Tests --------------------------------------------------------------------
describe('TooltipController', () => {
  it('should have valid default state', () => {
    expect(TooltipController.state).toEqual({
      message: '',
      open: false,
      triggerRect: {
        width: 0,
        height: 0,
        top: 0,
        left: 0
      },
      variant: 'shade'
    })
  })

  it('should show the tooltip as expected', () => {
    TooltipController.showTooltip(mockTooltip)
    expect(TooltipController.state.open).toEqual(true)
    expect(TooltipController.state.message).toEqual('Hello, World!')
  })

  it('should hide the tooltip as expected', () => {
    TooltipController.hide()
    expect(TooltipController.state.open).toEqual(false)
  })
})
