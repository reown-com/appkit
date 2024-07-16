// W3mFrameProvider.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { W3mFrameProvider } from '../src/W3mFrameProvider.js'

// Mocks
import { W3mFrameHelpers } from './mocks/W3mFrameHelpers.mock.js'
import { W3mFrameTypes } from '../src/W3mFrameTypes.js'

// Mock dependencies
vi.mock('../src/W3mFrameStorage')
vi.mock('../src/W3mFrameHelpers')

const SecureSiteMock = {
  approveRequest: ({ id, type, response }: { id: string; type: string; response: any }) =>
    setTimeout(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: `@w3m-frame/${type}_SUCCESS`,
            id,
            payload: response
          }
        })
      )
    }, 0),
  rejectRequest: ({ id, type, message }: { id: string; type: string; message: string }) => {
    setTimeout(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: `@w3m-frame/${type}_ERROR`,
            id,
            payload: {
              message
            }
          }
        })
      )
    }, 0)
  }
}

describe('W3mFrameProvider', () => {
  const projectId = 'test-project-id'
  let provider = new W3mFrameProvider(projectId)

  beforeEach(() => {
    provider = new W3mFrameProvider(projectId)
    provider['w3mFrame'].frameLoadPromise = Promise.resolve()
    window.postMessage = vi.fn()
  })

  it('should connect email', async () => {
    const payload = { email: 'test@example.com' }
    W3mFrameHelpers.checkIfAllowedToTriggerEmail.mockReturnValue(true)
    const responsePayload = { action: 'VERIFY_OTP' }

    const postAppEventSpy = vi
      .spyOn(provider['w3mFrame'].events, 'postAppEvent')
      .mockImplementation(({ id }) => {
        SecureSiteMock.approveRequest({ id, type: 'CONNECT_EMAIL', response: responsePayload })
      })

    const response = await provider.connectEmail(payload)

    expect(response).toEqual(responsePayload)
    expect(postAppEventSpy).toHaveBeenCalled()
  })

  it('should connect otp', async () => {
    const payload = { otp: '123456' }
    const postAppEventSpy = vi
      .spyOn(provider['w3mFrame'].events, 'postAppEvent')
      .mockImplementation(({ id }) => {
        SecureSiteMock.approveRequest({ id, type: 'CONNECT_OTP', response: undefined })
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
        SecureSiteMock.approveRequest({ id, type: 'GET_USER', response: responsePayload })
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
        SecureSiteMock.approveRequest({ id, type: 'SWITCH_NETWORK', response: responsePayload })
      })

    const response = await provider.switchNetwork(chainId)

    expect(response).toEqual(responsePayload)
    expect(postAppEventSpy).toHaveBeenCalled()
  })
})
