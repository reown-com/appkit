import { describe, expect, it, vi } from 'vitest'

import { SIWXConfig } from '../../src/core/SIWXConfig.js'
import type { SIWXMessenger } from '../../src/core/SIWXMessenger.js'
import type { SIWXSigner } from '../../src/core/SIWXSigner.js'
import type { SIWXStorage } from '../../src/core/SIWXStorage.js'

class TestSIWXConfig extends SIWXConfig {}

describe('SIWXConfig', () => {
  it('forwards the immutable signing context to its signer', async () => {
    const signer = {
      signMessage: vi.fn().mockResolvedValue('0xsignature')
    } as unknown as SIWXSigner
    const config = new TestSIWXConfig({
      messenger: {} as SIWXMessenger,
      verifiers: [],
      storage: {} as SIWXStorage,
      signer
    })
    const context = {
      message: 'Sign in',
      chainId: 'eip155:1' as const,
      accountAddress: '0x1234567890123456789012345678901234567890',
      connectorId: 'walletConnect'
    }

    await expect(config.signMessage(context)).resolves.toBe('0xsignature')
    expect(signer.signMessage).toHaveBeenCalledWith(context.message, {
      chainId: context.chainId,
      accountAddress: context.accountAddress,
      connectorId: context.connectorId
    })
  })
})
