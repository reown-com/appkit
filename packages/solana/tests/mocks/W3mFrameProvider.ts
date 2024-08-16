import { W3mFrameProvider } from '@web3modal/wallet'
import type { AuthProvider } from '../../src/providers/AuthProvider'
import { vi } from 'vitest'
import { TestConstants } from '../util/TestConstants'

export function mockW3mFrameProvider() {
  const w3mFrame = new W3mFrameProvider('projectId')

  w3mFrame.connect = vi.fn(() => Promise.resolve(mockSession()))
  w3mFrame.disconnect = vi.fn(() => Promise.resolve(undefined))

  return w3mFrame
}

export function mockSession(): AuthProvider.Session {
  return {
    address: TestConstants.accounts[0].address,
    chainId: TestConstants.chains[0]?.chainId || ''
  }
}
