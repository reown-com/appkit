import { describe, expect, it, vi } from 'vitest'
import { EnsController } from '../../index.js'

// -- Setup --------------------------------------------------------------------
const TEST_NAME = {
  name: 'test',
  registered: true,
  updated: 1,
  addresses: [
    {
      '0x123': {
        address: '0x123',
        created: '1'
      }
    }
  ],
  attributes: []
}
vi.mock('../../src/controllers/BlockchainApiController.js', async importOriginal => {
  const mod =
    await importOriginal<typeof import('../../src/controllers/BlockchainApiController.js')>()

  return {
    ...mod,
    BlockchainApiController: {
      lookupEnsName: async (name: string) => {
        if (name !== 'test') {
          throw new Error('Error resolving ENS name')
        }

        return Promise.resolve(TEST_NAME)
      }
    }
  }
})

// -- Tests --------------------------------------------------------------------
describe('EnsController', () => {
  it('should have valid default state', () => {
    expect(EnsController.state).toEqual({
      suggestions: [],
      error: '',
      loading: false
    })
  })

  it('should update state correctly on name resolution', async () => {
    const errorMessage = 'Error resolving ENS name'

    const name = await EnsController.resolveName('test')
    expect(EnsController.state.error).toBe('')
    expect(EnsController.state.loading).toBe(false)
    expect(name).toEqual(TEST_NAME)

    await expect(EnsController.resolveName('invalid'))
    expect(EnsController.state.error).toBe(errorMessage)
  })
})
