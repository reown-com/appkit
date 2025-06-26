import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  OptionsController,
  type SIWXSession
} from '@reown/appkit-controllers'

import { createSIWEConfig, mapToSIWX } from '../exports'

const siweConfig = createSIWEConfig({
  createMessage: () => {
    return 'mock-message'
  },
  getNonce: async () => {
    return 'mock-nonce'
  },
  getSession: async () => {
    return {
      address: 'mock-address',
      chainId: 1
    }
  },
  verifyMessage: async () => {
    return true
  },
  signOut: async () => {
    return true
  },
  onSignIn: () => {},
  onSignOut: () => {},
  enabled: true,
  getMessageParams: async () => {
    return {
      chains: [1],
      domain: 'mock-domain',
      uri: 'mock-uri',
      nonce: 'mock-nonce'
    }
  },
  nonceRefetchIntervalMs: 60000,
  sessionRefetchIntervalMs: 120000,
  signOutOnAccountChange: true,
  signOutOnNetworkChange: true,
  signOutOnDisconnect: true
})

const sessionMock = {
  data: {
    accountAddress: 'mock-address',
    chainId: 'eip155:1'
  }
} as unknown as SIWXSession

const networks = {
  mainnet: {
    id: '1',
    name: 'Ethereum',
    caipNetworkId: 'eip155:1',
    chainNamespace: 'eip155'
  } as unknown as CaipNetwork,
  polygon: {
    id: '137',
    name: 'Polygon',
    caipNetworkId: 'eip155:137',
    chainNamespace: 'eip155'
  } as unknown as CaipNetwork
}

describe('SIWE: mapToSIWX', () => {
  it('should correctly map methods', () => {
    const siwx = mapToSIWX(siweConfig)

    expect(siwx.addSession).toBeTypeOf('function')
    expect(siwx.setSessions).toBeTypeOf('function')
    expect(siwx.getSessions).toBeTypeOf('function')
    expect(siwx.revokeSession).toBeTypeOf('function')
    expect(siwx.createMessage).toBeTypeOf('function')
  })

  describe('createMessage', () => {
    it('should correctly map createMessage', async () => {
      const siwx = mapToSIWX(siweConfig)
      const message = await siwx.createMessage({
        accountAddress: 'mock-address',
        chainId: 'eip155:1'
      })

      expect(message).toMatchObject({
        nonce: 'mock-nonce',
        version: '1',
        accountAddress: 'mock-address',
        chainId: 'eip155:1',
        domain: 'mock-domain',
        uri: 'mock-uri',
        statement: undefined,
        issuedAt: expect.any(String)
      })

      expect(message.toString()).toBe('mock-message')
    })
  })

  describe('addSession', () => {
    it('should correctly map addSession', async () => {
      const siwx = mapToSIWX(siweConfig)

      const session = {
        data: {
          accountAddress: 'mock-address',
          chainId: 'eip155:1'
        }
      } as unknown as SIWXSession

      const verifyMessageSpy = vi.spyOn(siweConfig.methods, 'verifyMessage')
      const onSignInSpy = vi.spyOn(siweConfig.methods, 'onSignIn')

      await expect(siwx.addSession(session)).resolves.not.toThrow()

      expect(verifyMessageSpy).toBeCalledWith(session)
      expect(onSignInSpy).toBeCalledWith({
        address: 'mock-address',
        chainId: 1
      })
    })

    it('should throw if verifyMessage fails', async () => {
      const siwx = mapToSIWX(siweConfig)

      const session = {
        data: {
          accountAddress: 'mock-address',
          chainId: 'eip155:1'
        }
      } as unknown as SIWXSession

      vi.spyOn(siweConfig.methods, 'verifyMessage').mockResolvedValueOnce(false)

      await expect(siwx.addSession(session)).rejects.toThrow('Failed to verify message')
    })

    it('should ignore non-EVM chains', async () => {
      const siwx = mapToSIWX(siweConfig)

      const session = {
        data: {
          accountAddress: 'mock-address',
          chainId: 'solana:mainnet'
        }
      } as unknown as SIWXSession

      const verifyMessageSpy = vi.spyOn(siweConfig.methods, 'verifyMessage')
      const onSignInSpy = vi.spyOn(siweConfig.methods, 'onSignIn')

      await expect(siwx.addSession(session)).resolves.not.toThrow()

      expect(verifyMessageSpy).not.toBeCalled()
      expect(onSignInSpy).not.toBeCalled()
    })
  })

  describe('revokeSession', () => {
    it('should correctly map revokeSession', async () => {
      const siwx = mapToSIWX(siweConfig)

      const signOutSpy = vi.spyOn(siweConfig.methods, 'signOut')
      const onSignOutSpy = vi.spyOn(siweConfig.methods, 'onSignOut')

      await expect(siwx.revokeSession('eip155:1', 'mock-address')).resolves.not.toThrow()

      expect(signOutSpy).toBeCalled()
      expect(onSignOutSpy).toBeCalled()
    })

    it('should ignore errors', async () => {
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'signOut').mockRejectedValueOnce(new Error('mock-error'))

      await expect(siwx.revokeSession('eip155:1', 'mock-address')).resolves.not.toThrow()
    })
  })

  describe('setSessions', () => {
    it('should correctly map setSessions', async () => {
      const siwx = mapToSIWX(siweConfig)

      const addSessionSpy = vi.spyOn(siwx, 'addSession')
      const signOutSpy = vi.spyOn(siweConfig.methods, 'signOut')

      await expect(siwx.setSessions([sessionMock])).resolves.not.toThrow()

      expect(addSessionSpy).toBeCalledWith(sessionMock)
      expect(signOutSpy).not.toBeCalled()
    })

    it('should sign out if no sessions', async () => {
      const siwx = mapToSIWX(siweConfig)

      const addSessionSpy = vi.spyOn(siwx, 'addSession')
      const signOutSpy = vi.spyOn(siweConfig.methods, 'signOut')

      await expect(siwx.setSessions([])).resolves.not.toThrow()

      expect(addSessionSpy).not.toBeCalled()
      expect(signOutSpy).toBeCalled()
    })

    it('should only use the active network session', async () => {
      const siwx = mapToSIWX(siweConfig)

      const addSessionSpy = vi.spyOn(siwx, 'addSession')

      const firstSessionMock = { ...sessionMock }
      const secondSessionMock = {
        ...sessionMock,
        data: { ...sessionMock.data, chainId: 'eip155:2' as const }
      }

      vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue({
        caipNetworkId: 'eip155:2'
      } as any)

      await expect(siwx.setSessions([firstSessionMock, secondSessionMock])).resolves.not.toThrow()

      expect(addSessionSpy).not.toBeCalledWith(firstSessionMock)
      expect(addSessionSpy).toBeCalledWith(secondSessionMock)
    })
  })

  describe('getSessions', () => {
    it('should correctly map getSessions', async () => {
      const siwx = mapToSIWX(siweConfig)

      await expect(siwx.getSessions('eip155:1', 'mock-address')).resolves.toMatchObject([
        {
          data: {
            accountAddress: 'mock-address',
            chainId: 'eip155:1'
          },
          message: '',
          signature: ''
        }
      ])
    })

    it('should ignore non-EVM chains', async () => {
      const siwx = mapToSIWX(siweConfig)

      await expect(siwx.getSessions('solana:mainnet', 'mock-address')).resolves.toMatchObject([
        {
          data: {
            accountAddress: 'mock-address',
            chainId: 'solana:mainnet'
          },
          message: '',
          signature: ''
        }
      ])
    })

    it('should ignore siwe.methods.getSession error and return empty sessions', async () => {
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockRejectedValueOnce(new Error('mock-error'))

      await expect(siwx.getSessions('eip155:1', 'mock-address')).resolves.toMatchObject([])
    })

    it('should accept undefined address or chain', async () => {
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValueOnce({
        address: undefined as any,
        chainId: 1
      })

      await expect(siwx.getSessions('eip155:1', 'mock-address')).resolves.toMatchObject([])

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValueOnce({
        address: 'mock-address',
        chainId: undefined as any
      })

      await expect(siwx.getSessions('eip155:1', 'mock-address')).resolves.toMatchObject([])
    })

    it('should handle network change with signOutOnNetworkChange enabled', async () => {
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValue({
        address: 'mock-address',
        chainId: 1
      })

      // Different network than session
      await expect(siwx.getSessions('eip155:2', 'mock-address')).resolves.toMatchObject([])
    })

    it('should ignore network mismatch when signOutOnNetworkChange is disabled', async () => {
      siweConfig.options.signOutOnNetworkChange = false
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValue({
        address: 'mock-address',
        chainId: 1
      })

      // Different network should still return session when signOutOnNetworkChange is false
      await expect(siwx.getSessions('eip155:2', 'mock-address')).resolves.toMatchObject([
        {
          data: {
            accountAddress: 'mock-address',
            chainId: 'eip155:1'
          },
          message: '',
          signature: ''
        }
      ])

      siweConfig.options.signOutOnNetworkChange = true
    })

    it('should handle case-insensitive address comparison when signOutOnNetworkChange is disabled', async () => {
      siweConfig.options.signOutOnNetworkChange = false
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValue({
        address: 'MOCK-ADDRESS',
        chainId: 1
      })

      // Should match despite different case when signOutOnNetworkChange is false
      await expect(siwx.getSessions('eip155:1', 'mock-address')).resolves.toMatchObject([
        {
          data: {
            accountAddress: 'MOCK-ADDRESS',
            chainId: 'eip155:1'
          },
          message: '',
          signature: ''
        }
      ])

      siweConfig.options.signOutOnNetworkChange = true
    })

    it('should handle different addresses when signOutOnNetworkChange is disabled', async () => {
      siweConfig.options.signOutOnNetworkChange = false
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValue({
        address: 'mock-address',
        chainId: 1
      })

      // Different address should return empty array even with signOutOnNetworkChange disabled
      await expect(siwx.getSessions('eip155:1', 'different-address')).resolves.toMatchObject([])

      siweConfig.options.signOutOnNetworkChange = true
    })
  })

  describe('siwe.options.signOutOnNetworkChange', () => {
    it('should not sign out on network change if getLastConnectedSIWECaipNetwork is defined', async () => {
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValue({
        address: 'mock-address',
        chainId: 1
      })
      const signOutSpy = vi.spyOn(siweConfig.methods, 'signOut')
      const onSignOutSpy = vi.spyOn(siweConfig.methods, 'onSignOut')

      OptionsController.setSIWX(siwx)
      ChainController.setLastConnectedSIWECaipNetwork(networks.mainnet)
      ChainController.setActiveCaipNetwork(networks.polygon)

      // Wait for the event loop to finish
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(signOutSpy).not.toHaveBeenCalled()
      expect(onSignOutSpy).not.toHaveBeenCalled()
    })

    it('should not sign out on network change if disabled', async () => {
      siweConfig.options.signOutOnNetworkChange = false
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValue({
        address: 'mock-address',
        chainId: 1
      })
      const signOutSpy = vi.spyOn(siweConfig.methods, 'signOut')
      const onSignOutSpy = vi.spyOn(siweConfig.methods, 'onSignOut')

      OptionsController.setSIWX(siwx)

      ChainController.setActiveCaipNetwork(networks.polygon)

      // Wait for the event loop to finish
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(signOutSpy).not.toHaveBeenCalled()
      expect(onSignOutSpy).not.toHaveBeenCalled()

      siweConfig.options.signOutOnNetworkChange = true
    })

    it('should not sign out on network change if no active caip address', async () => {
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValue({
        address: 'mock-address',
        chainId: 1
      })
      const signOutSpy = vi.spyOn(siweConfig.methods, 'signOut')
      const onSignOutSpy = vi.spyOn(siweConfig.methods, 'onSignOut')

      OptionsController.setSIWX(siwx)
      ChainController.setActiveCaipNetwork(undefined)

      // Wait for the event loop to finish
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(signOutSpy).not.toHaveBeenCalled()
      expect(onSignOutSpy).not.toHaveBeenCalled()
    })
  })

  describe('siwe.options.signOutOnDisconnect', () => {
    beforeEach(() => {
      ChainController.setActiveCaipNetwork({
        ...networks.mainnet,
        caipNetworkId: 'eip155:1',
        chainNamespace: 'eip155'
      })
      AccountController.setCaipAddress('eip155:1:mock-address', 'eip155')
    })

    it('should sign out on disconnect', async () => {
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValue({
        address: 'mock-address',
        chainId: 1
      })
      const signOutSpy = vi.spyOn(siweConfig.methods, 'signOut')
      const onSignOutSpy = vi.spyOn(siweConfig.methods, 'onSignOut')

      OptionsController.setSIWX(siwx)
      AccountController.setCaipAddress(undefined, 'eip155')

      // Wait for the event loop to finish
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(signOutSpy).toHaveBeenCalled()
      expect(onSignOutSpy).toHaveBeenCalled()
    })

    it('should not sign out on disconnect if disabled', async () => {
      siweConfig.options.signOutOnDisconnect = false
      siweConfig.options.signOutOnAccountChange = false
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValue({
        address: 'mock-address',
        chainId: 1
      })
      const signOutSpy = vi.spyOn(siweConfig.methods, 'signOut')
      const onSignOutSpy = vi.spyOn(siweConfig.methods, 'onSignOut')

      OptionsController.setSIWX(siwx)
      AccountController.setCaipAddress(undefined, 'eip155')

      // Wait for the event loop to finish
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(signOutSpy).not.toHaveBeenCalled()
      expect(onSignOutSpy).not.toHaveBeenCalled()

      siweConfig.options.signOutOnDisconnect = true
      siweConfig.options.signOutOnAccountChange = true
    })
  })

  describe('siwe.options.signOutOnAccountChange', () => {
    beforeEach(() => {
      ChainController.setActiveCaipNetwork({
        ...networks.mainnet,
        caipNetworkId: 'eip155:1',
        chainNamespace: 'eip155'
      })
      AccountController.setCaipAddress('eip155:1:mock-address', 'eip155')
    })

    it('should sign out on account change', async () => {
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValue({
        address: 'mock-address',
        chainId: 1
      })
      const signOutSpy = vi.spyOn(siweConfig.methods, 'signOut')
      const onSignOutSpy = vi.spyOn(siweConfig.methods, 'onSignOut')

      OptionsController.setSIWX(siwx)
      AccountController.setCaipAddress('eip155:1:mock-address2', 'eip155')

      // Wait for the event loop to finish
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(signOutSpy).toHaveBeenCalled()
      expect(onSignOutSpy).toHaveBeenCalled()
    })

    it('should not sign out on account change if disabled', async () => {
      siweConfig.options.signOutOnAccountChange = false
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValue({
        address: 'mock-address',
        chainId: 1
      })
      const signOutSpy = vi.spyOn(siweConfig.methods, 'signOut')
      const onSignOutSpy = vi.spyOn(siweConfig.methods, 'onSignOut')

      OptionsController.setSIWX(siwx)
      AccountController.setCaipAddress('eip155:1:mock-address2', 'eip155')

      // Wait for the event loop to finish
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(signOutSpy).not.toHaveBeenCalled()
      expect(onSignOutSpy).not.toHaveBeenCalled()

      siweConfig.options.signOutOnAccountChange = true
    })

    // New test case for case-insensitive address comparison
    it('should handle case-insensitive address comparison', async () => {
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValue({
        address: 'MOCK-ADDRESS',
        chainId: 1
      })
      const signOutSpy = vi.spyOn(siweConfig.methods, 'signOut')
      const onSignOutSpy = vi.spyOn(siweConfig.methods, 'onSignOut')

      OptionsController.setSIWX(siwx)
      AccountController.setCaipAddress('eip155:1:mock-address', 'eip155')

      // Wait for the event loop to finish
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(signOutSpy).not.toHaveBeenCalled()
      expect(onSignOutSpy).not.toHaveBeenCalled()
    })

    // New test case for unchanged account
    it('should not sign out if account remains unchanged', async () => {
      const siwx = mapToSIWX(siweConfig)

      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValue({
        address: 'mock-address',
        chainId: 1
      })
      const signOutSpy = vi.spyOn(siweConfig.methods, 'signOut')
      const onSignOutSpy = vi.spyOn(siweConfig.methods, 'onSignOut')

      OptionsController.setSIWX(siwx)
      AccountController.setCaipAddress('eip155:1:mock-address', 'eip155')

      // Wait for the event loop to finish
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(signOutSpy).not.toHaveBeenCalled()
      expect(onSignOutSpy).not.toHaveBeenCalled()
    })
  })
})
