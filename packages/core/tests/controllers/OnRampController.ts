import { describe, expect, it } from 'vitest'
import { OnRampController } from '../../index.js'
import { ONRAMP_PROVIDERS } from '../../src/utils/ConstantsUtil.js'

// -- Tests --------------------------------------------------------------------
describe('OnRampController', () => {
  it('should have valid default state', () => {
    expect(OnRampController.state).toEqual({
      providers: ONRAMP_PROVIDERS,
      selectedProvider: null,
      error: null
    })
  })

  it('should update state correctly on setProjectId()', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    OnRampController.setSelectedProvider(ONRAMP_PROVIDERS[0] as any)
    expect(OnRampController.state.selectedProvider).toEqual(ONRAMP_PROVIDERS[0])
  })
})
