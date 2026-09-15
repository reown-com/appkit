import { describe, expect, it, vi } from 'vitest'

import { waitForSignatureConfirmation } from '../utils/waitForSignatureConfirmation'

describe('waitForSignatureConfirmation', () => {
  it('resolves when signature status is confirmed without an error', async () => {
    const connection = {
      getSignatureStatus: vi.fn().mockResolvedValue({
        value: { confirmationStatus: 'confirmed', err: null }
      })
    }

    await expect(
      waitForSignatureConfirmation(connection, 'sig-ok', {
        timeoutMs: 100,
        pollIntervalMs: 10
      })
    ).resolves.toBeUndefined()
  })

  it('rejects when signature status includes an on-chain error', async () => {
    const connection = {
      getSignatureStatus: vi.fn().mockResolvedValue({
        value: { err: { InstructionError: [0, 'Custom'] } }
      })
    }

    await expect(
      waitForSignatureConfirmation(connection, 'sig-failed', {
        timeoutMs: 100,
        pollIntervalMs: 10
      })
    ).rejects.toThrow('Transaction failed on-chain')
  })

  it('rejects when signature status stays null', async () => {
    const connection = {
      getSignatureStatus: vi.fn().mockResolvedValue({ value: null })
    }

    await expect(
      waitForSignatureConfirmation(connection, 'sig-pending', {
        timeoutMs: 40,
        pollIntervalMs: 10
      })
    ).rejects.toThrow('Transaction confirmation timed out')
  })
})
