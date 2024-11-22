import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModalController, OptionsController, RouterController, SIWXUtil } from '@reown/appkit-core'
import { AppKit } from '@reown/appkit'
import * as networks from '@reown/appkit/networks'
import { createSIWEConfig, type AppKitSIWEClient } from '@reown/appkit-siwe'
import { mockUniversalAdapter } from './mocks/Adapter'
import mockProvider from './mocks/UniversalProvider'

describe('SIWE mapped to SIWX', () => {
  let siweConfig: AppKitSIWEClient
  let appkit: AppKit

  beforeEach(async () => {
    siweConfig = createSIWEConfig({
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
    appkit = new AppKit({
      adapters: [mockUniversalAdapter],
      projectId: 'mock-project-id',
      networks: [networks.mainnet],
      defaultNetwork: networks.mainnet,
      siweConfig,
      sdkVersion: 'html-test-test'
    })

    // Wait for the appkit to be ready
    await new Promise(resolve => setTimeout(resolve, 1))

    // Set CAIP address to represent connected state
    appkit.setCaipAddress('eip155:1:mock-address', 'eip155')
  })

  it('should fulfill siwx', () => {
    expect(OptionsController.state.siwx).toBeDefined()
  })

  describe('SIWXUtils against SIWE usage', () => {
    it('should have siwx', async () => {
      expect(SIWXUtil.getSIWX()).toBeDefined()
    })

    it('should initializeIfEnabled', async () => {
      vi.spyOn(siweConfig.methods, 'getSession').mockResolvedValueOnce(null)
      await SIWXUtil.initializeIfEnabled()

      expect(RouterController.state.view).toBe('SIWXSignMessage')
      expect(ModalController.state.open).toBe(true)
    })

    it('should requestSignMessage', async () => {
      const getNonceSpy = vi.spyOn(siweConfig.methods, 'getNonce')
      const createMessageSpy = vi.spyOn(siweConfig.methods, 'createMessage')
      const verifyMessageSpy = vi.spyOn(siweConfig.methods, 'verifyMessage')

      await SIWXUtil.requestSignMessage()

      expect(getNonceSpy).toHaveBeenCalled()
      expect(createMessageSpy).toHaveBeenCalled()
      expect(verifyMessageSpy).toHaveBeenCalledWith({
        data: {
          accountAddress: 'mock-address',
          chainId: 'eip155:1',
          domain: 'mock-domain',
          expirationTime: undefined,
          issuedAt: expect.any(String),
          nonce: 'mock-nonce',
          notBefore: undefined,
          requestId: undefined,
          resources: undefined,
          statement: undefined,
          toString: expect.any(Function),
          uri: 'mock-uri',
          version: '1'
        },
        message: 'mock-message',
        signature: ''
      })
    })

    it('should getSessions', async () => {
      const getSessionSpy = vi.spyOn(siweConfig.methods, 'getSession')
      const sessions = await SIWXUtil.getSessions()

      expect(getSessionSpy).toHaveBeenCalled()
      expect(sessions).toEqual([
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

    it('should universalProviderAuthenticate', async () => {
      const getNonceSpy = vi.spyOn(siweConfig.methods, 'getNonce')
      const verifyMessageSpy = vi.spyOn(siweConfig.methods, 'verifyMessage')

      const cacao = {
        h: {
          t: 'caip122'
        },
        p: {
          aud: 'mock-aud',
          iss: 'did:pkh:eip155:1:mock-address',
          domain: 'mock-domain',
          nonce: 'mock-nonce'
        },
        s: {
          m: 'mock-message',
          s: 'mock-signature',
          t: 'eip191'
        }
      } as const

      vi.spyOn(mockProvider, 'authenticate').mockResolvedValueOnce({
        session: {} as any,
        auths: [cacao]
      })

      await SIWXUtil.universalProviderAuthenticate({
        universalProvider: mockProvider,
        chains: ['eip155:1'],
        methods: ['eth_sign']
      })

      expect(getNonceSpy).toHaveBeenCalled()
      expect(verifyMessageSpy).toHaveBeenCalledWith({
        cacao: expect.objectContaining(cacao),
        data: expect.objectContaining({
          chainId: 'eip155:1',
          accountAddress: 'mock-address'
        }),
        message: 'Formatted auth message',
        signature: 'mock-signature'
      })
    })
  })

  describe('siweConfig should still work outside of AppKit', () => {
    it('should execute signIn', async () => {
      const requestSignMessageSpy = vi.spyOn(SIWXUtil, 'requestSignMessage')
      const onSignInSpy = vi.spyOn(siweConfig.methods, 'onSignIn')

      const session = await siweConfig.signIn()

      expect(requestSignMessageSpy).toHaveBeenCalled()
      expect(onSignInSpy).toHaveBeenCalled()
      expect(session).toEqual({
        address: 'mock-address',
        chainId: 1
      })
    })

    it('should execute signOut', async () => {
      const setSessionsSpy = vi.spyOn(OptionsController.state.siwx!, 'setSessions')
      const onSignOutSpy = vi.spyOn(siweConfig.methods, 'onSignOut')
      await siweConfig.signOut()

      expect(setSessionsSpy).toHaveBeenCalledWith([])
      expect(onSignOutSpy).toHaveBeenCalled()
    })

    it('should execute getNonce', async () => {
      const nonce = await siweConfig.getNonce()

      expect(nonce).toBe('mock-nonce')
    })

    it('should execute getMessageParams', async () => {
      const messageParams = await siweConfig.getMessageParams?.()

      expect(messageParams).toEqual({
        chains: [1],
        domain: 'mock-domain',
        uri: 'mock-uri',
        nonce: 'mock-nonce'
      })
    })

    it('should execute createMessage', () => {
      const message = siweConfig.createMessage({} as any)

      expect(message).toBe('mock-message')
    })

    it('should execute verifyMessage', async () => {
      const isValid = await siweConfig.verifyMessage({} as any)

      expect(isValid).toBe(true)
    })

    it('should execute getSession', async () => {
      const session = await siweConfig.getSession()

      expect(session).toEqual({
        address: 'mock-address',
        chainId: 1
      })
    })
  })
})
