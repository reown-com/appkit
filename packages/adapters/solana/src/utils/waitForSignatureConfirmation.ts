import type { Connection } from '@solana/web3.js'

export const SIGNATURE_CONFIRMATION_TIMEOUT_MS = 60_000
export const SIGNATURE_CONFIRMATION_POLL_MS = 1_000

export async function waitForSignatureConfirmation(
  connection: Pick<Connection, 'getSignatureStatus'>,
  signature: string,
  options: { timeoutMs?: number; pollIntervalMs?: number } = {}
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? SIGNATURE_CONFIRMATION_TIMEOUT_MS
  const pollIntervalMs = options.pollIntervalMs ?? SIGNATURE_CONFIRMATION_POLL_MS
  const startedAt = Date.now()

  await new Promise<void>((resolve, reject) => {
    let settled = false

    const finish = (callback: () => void) => {
      if (settled) {
        return
      }
      settled = true
      clearInterval(interval)
      callback()
    }

    const poll = async () => {
      try {
        if (Date.now() - startedAt >= timeoutMs) {
          finish(() => reject(new Error('Transaction confirmation timed out')))

          return
        }

        const status = await connection.getSignatureStatus(signature)

        if (settled) {
          return
        }

        if (!status?.value) {
          return
        }

        if (status.value.err) {
          finish(() => reject(new Error('Transaction failed on-chain')))

          return
        }

        finish(() => resolve())
      } catch (error) {
        finish(() => reject(error))
      }
    }

    const interval = setInterval(() => {
      void poll()
    }, pollIntervalMs)

    void poll()
  })
}
