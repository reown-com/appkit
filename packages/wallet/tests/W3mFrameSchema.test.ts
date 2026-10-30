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
})
