import { type PublicClient, createPublicClient, http } from 'viem'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'

import { EIP155Verifier } from '../../src/index.js'
import { mockSession } from '../mocks/mockSession.js'

const mockHttp = 'https://mock-rpc.com'
const mockCaipNetwork = {
  id: 1,
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1',
  name: 'Mock Chain',
  nativeCurrency: {
    name: 'Mock Token',
    symbol: 'MOCK',
    decimals: 18
  },
  rpcUrls: { default: { http: [mockHttp] } }
} as unknown as CaipNetwork

describe('EIP155Verifier', () => {
  const verifier = new EIP155Verifier()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should have eip155 as the chain namespace', () => {
    expect(verifier.chainNamespace).toBe('eip155')
  })

  describe('shouldVerify', () => {
    test('should verify only eip155 chain id', () => {
      expect(
        verifier.shouldVerify(
          mockSession({
            data: {
              chainId: 'eip155:1'
            }
          })
        )
      ).toBe(true)

      expect(
        verifier.shouldVerify(
          mockSession({
            data: {
              chainId: 'solana:mainnet'
            }
          })
        )
      ).toBe(false)
    })
  })

  describe('verify', () => {
    beforeEach(() => {
      // Mock viem functions with proper typing
      vi.mock('viem', () => ({
        createPublicClient: vi.fn(
          () =>
            ({
              verifyMessage: vi.fn().mockResolvedValue(true)
            }) as unknown as PublicClient
        ),
        http: vi.fn()
      }))
    })

    test('should successfully verify when caipNetwork is found', async () => {
      const session = mockSession()

      // Mock ChainController to return valid caipNetwork
      vi.spyOn(ChainController.state.chains, 'get').mockReturnValue({
        caipNetworks: [mockCaipNetwork]
      })

      const result = await verifier.verify(session)

      expect(result).toBe(true)
      expect(http).toHaveBeenCalledWith(mockHttp)
      expect(createPublicClient).toHaveBeenCalledWith({
        chain: expect.objectContaining(mockCaipNetwork),
        transport: http(mockHttp)
      })

      const client = (createPublicClient as any).mock.results[0].value
      expect(client.verifyMessage).toHaveBeenCalledWith({
        message: session.message.toString(),
        signature: session.signature,
        address: session.data.accountAddress
      })
    })

    test('should throw error when caipNetwork is not found', async () => {
      const session = mockSession()

      // Mock ChainController to return empty caipNetworks
      vi.spyOn(ChainController.state.chains, 'get').mockReturnValue({
        caipNetworks: []
      })

      await expect(verifier.verify(session)).rejects.toThrow('EIP155.verify: CaipNetwork not found')
    })

    test('should return false when verifyMessage fails', async () => {
      const session = mockSession()

      // Mock ChainController to return valid caipNetwork
      vi.spyOn(ChainController.state.chains, 'get').mockReturnValue({
        caipNetworks: [mockCaipNetwork]
      })

      // Mock verifyMessage to fail
      vi.mocked(createPublicClient).mockImplementation(
        () =>
          ({
            verifyMessage: vi.fn().mockResolvedValue(false)
          }) as unknown as PublicClient
      )

      const result = await verifier.verify(session)
      expect(result).toBe(false)
    })

    test('should return false when verification throws error', async () => {
      const session = mockSession()

      // Mock ChainController to return valid caipNetwork
      vi.spyOn(ChainController.state.chains, 'get').mockReturnValue({
        caipNetworks: [mockCaipNetwork]
      })

      // Mock verifyMessage to throw error
      vi.mocked(createPublicClient).mockImplementation(
        () =>
          ({
            verifyMessage: vi.fn().mockRejectedValue(new Error('Verification failed'))
          }) as unknown as PublicClient
      )

      const result = await verifier.verify(session)
      expect(result).toBe(false)
    })
  })
})
