import { describe, expect, it } from 'vitest'
import { AssetController } from '../../index.js'

// -- Tests --------------------------------------------------------------------
describe('AssetController', () => {
  it('should have valid default state', () => {
    expect(AssetController.state).toEqual({
      walletImages: {},
      networkImages: {},
      connectorImages: {},
      tokenImages: {}
    })
  })
})
