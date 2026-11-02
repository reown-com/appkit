import { describe, expect, it } from 'vitest'

import { W3mFrameConstants } from '../src/W3mFrameConstants.js'
import { W3mFrameSchema } from '../src/W3mFrameSchema.js'

describe('W3mFrameSchema', () => {
  it('accepts a connect email app event', () => {
    const result = W3mFrameSchema.appEvent.safeParse({
      type: W3mFrameConstants.APP_CONNECT_EMAIL,
      payload: { email: 'user@example.com' }
    })

    expect(result.success).toBe(true)
  })

  it('rejects a connect email app event with an invalid email', () => {
    const result = W3mFrameSchema.appEvent.safeParse({
      type: W3mFrameConstants.APP_CONNECT_EMAIL,
      payload: { email: 'not-an-email' }
    })

    expect(result.success).toBe(false)
  })

  it('accepts string and number theme variables', () => {
    const result = W3mFrameSchema.appEvent.safeParse({
      type: W3mFrameConstants.APP_SYNC_THEME,
      payload: { themeVariables: { a: 'x', b: 1 }, w3mThemeVariables: { c: 'y' } }
    })

    expect(result.success).toBe(true)
  })

  it('rejects a numeric w3m theme variable', () => {
    const result = W3mFrameSchema.appEvent.safeParse({
      type: W3mFrameConstants.APP_SYNC_THEME,
      payload: { themeVariables: { a: 'x' }, w3mThemeVariables: { c: 1 } }
    })

    expect(result.success).toBe(false)
  })

  it('rejects an app event with an unknown type', () => {
    const result = W3mFrameSchema.appEvent.safeParse({ type: '@w3m-app/DOES_NOT_EXIST' })

    expect(result.success).toBe(false)
  })

  it('rejects a frame event with an unknown type', () => {
    const result = W3mFrameSchema.frameEvent.safeParse({ type: '@w3m-frame/DOES_NOT_EXIST' })

    expect(result.success).toBe(false)
  })

  it('accepts a frame is-connected success event', () => {
    const result = W3mFrameSchema.frameEvent.safeParse({
      type: W3mFrameConstants.FRAME_IS_CONNECTED_SUCCESS,
      payload: { isConnected: true }
    })

    expect(result.success).toBe(true)
  })

  it('accepts a frame rpc success event with a payload', () => {
    const result = W3mFrameSchema.frameEvent.safeParse({
      type: W3mFrameConstants.FRAME_RPC_REQUEST_SUCCESS,
      payload: '0x1'
    })

    expect(result.success).toBe(true)
  })

  it('accepts a frame rpc success event without a payload key', () => {
    const result = W3mFrameSchema.frameEvent.safeParse({
      type: W3mFrameConstants.FRAME_RPC_REQUEST_SUCCESS
    })

    expect(result.success).toBe(true)
  })

  describe('rpc request app event', () => {
    const rpcRequest = {
      method: 'personal_sign',
      params: ['0xdeadbeef', '0x0000000000000000000000000000000000000001']
    }

    it('accepts a request with chain id, namespace and rpc url', () => {
      const payload = {
        ...rpcRequest,
        chainId: 1,
        chainNamespace: 'eip155',
        rpcUrl: 'https://rpc.example.com'
      }
      const result = W3mFrameSchema.appEvent.safeParse({
        type: W3mFrameConstants.APP_RPC_REQUEST,
        payload
      })

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({ payload })
    })

    it('rejects a request with an invalid chain namespace', () => {
      const result = W3mFrameSchema.appEvent.safeParse({
        type: W3mFrameConstants.APP_RPC_REQUEST,
        payload: { ...rpcRequest, chainNamespace: 'not-a-namespace' }
      })

      expect(result.success).toBe(false)
    })

    it('rejects a request with an unknown method', () => {
      const result = W3mFrameSchema.appEvent.safeParse({
        type: W3mFrameConstants.APP_RPC_REQUEST,
        payload: { method: 'eth_doesNotExist', params: [] }
      })

      expect(result.success).toBe(false)
    })
  })
})
