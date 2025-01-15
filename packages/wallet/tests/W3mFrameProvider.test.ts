import * as logger from '@walletconnect/logger'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { W3mFrameConstants } from '../src/W3mFrameConstants.js'
import { W3mFrameProvider } from '../src/W3mFrameProvider.js'
import { W3mFrameStorage } from '../src/W3mFrameStorage.js'
import { SecureSiteMock } from './mocks/SecureSite.mock.js'
// Mocks
import { W3mFrameHelpers } from './mocks/W3mFrameHelpers.mock.js'

describe('W3mFrameProvider', () => {
  const mockTimeout = vi.fn

  const projectId = 'test-project-id'
  let provider = new W3mFrameProvider({ projectId, onTimeout: mockTimeout })

  beforeEach(() => {
    provider = new W3mFrameProvider({ projectId })
    provider['w3mFrame'].frameLoadPromise = Promise.resolve()
    window.postMessage = vi.fn()
  })

  it('should connect email', async () => {
    const payload = { email: 'test@example.com' }
    W3mFrameHelpers.checkIfAllowedToTriggerEmail.mockReturnValue(true)
    const responsePayload = { action: 'VERIFY_OTP' }

    // Fire secure site approval from postAppEvent since we need an ID to approve the request
    const postAppEventSpy = vi
      .spyOn(provider['w3mFrame'].events, 'postAppEvent')
      .mockImplementation(({ id }) => {
        SecureSiteMock.approveRequest({
          id: id as string,
          type: 'CONNECT_EMAIL',
          response: responsePayload
        })
      })

    const response = await provider.connectEmail(payload)

    expect(response).toEqual(responsePayload)
    expect(postAppEventSpy).toHaveBeenCalled()

    const lastLoginTime = W3mFrameStorage.get(W3mFrameConstants.LAST_EMAIL_LOGIN_TIME)
    expect(lastLoginTime).toBeDefined()
  })

  it('should connect otp', async () => {
    const payload = { otp: '123456' }
    const postAppEventSpy = vi
      .spyOn(provider['w3mFrame'].events, 'postAppEvent')
      .mockImplementation(({ id }) => {
        SecureSiteMock.approveRequest({
          id: id as string,
          type: 'CONNECT_OTP',
          response: undefined
        })
      })

    const response = await provider.connectOtp(payload)

    expect(response).toEqual(undefined)
    expect(postAppEventSpy).toHaveBeenCalled()
  })

  it('should connect', async () => {
    const payload = { chainId: 1 }
    const responsePayload = { address: '0xd34db33f', chainId: 1, email: 'test@walletconnect.com' }

    const postAppEventSpy = vi
      .spyOn(provider['w3mFrame'].events, 'postAppEvent')
      .mockImplementation(({ id }) => {
        SecureSiteMock.approveRequest({
          id: id as string,
          type: 'GET_USER',
          response: responsePayload
        })
      })

    const response = await provider.connect(payload)

    expect(response).toEqual(responsePayload)
    expect(postAppEventSpy).toHaveBeenCalled()
  })

  it('should switch network', async () => {
    const chainId = 42
    const responsePayload = { chainId: 42 }

    const postAppEventSpy = vi
      .spyOn(provider['w3mFrame'].events, 'postAppEvent')
      .mockImplementation(({ id }) => {
        SecureSiteMock.approveRequest({
          id: id as string,
          type: 'SWITCH_NETWORK',
          response: responsePayload
        })
      })

    const response = await provider.switchNetwork(chainId)

    expect(response).toEqual(responsePayload)
    expect(postAppEventSpy).toHaveBeenCalled()
  })

  it(
    'should timeout after 30 seconds',
    async () => {
      const postAppEventSpy = vi
        .spyOn(provider['w3mFrame'].events, 'postAppEvent')
        .mockImplementation(() => {
          // Do nothing
        })

      const mockTimeoutSpy = vi.spyOn(provider, 'onTimeout')

      await expect(provider.connectEmail({ email: 'test@example.com' })).rejects.toThrow()

      expect(postAppEventSpy).toHaveBeenCalled()

      expect(mockTimeoutSpy).toHaveBeenCalled()
    },
    { timeout: 35_000 }
  )

  it('should create logger if enableLogger is undefined', async () => {
    const generateChildLoggerSpy = vi.spyOn(logger, 'generateChildLogger')
    provider = new W3mFrameProvider({ projectId, enableLogger: true })
    expect(generateChildLoggerSpy).toHaveBeenCalled()
  })

  it('should create logger if enableLogger is true', async () => {
    const generatePlatformLoggerSpy = vi.spyOn(logger, 'generatePlatformLogger')
    provider = new W3mFrameProvider({ projectId, enableLogger: true })
    expect(generatePlatformLoggerSpy).toHaveBeenCalled()
  })

  it('should not create logger if enableLogger is false', async () => {
    const generatePlatformLoggerSpy = vi.spyOn(logger, 'generatePlatformLogger')
    provider = new W3mFrameProvider({ projectId, enableLogger: false })
    expect(generatePlatformLoggerSpy).not.toHaveBeenCalled()
  })
})
