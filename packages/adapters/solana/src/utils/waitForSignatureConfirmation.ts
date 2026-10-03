import type { TransactionSignature } from '@solana/web3.js'

import type { Connection } from '@reown/appkit-utils/solana'

/**
 * Polls the RPC until the given signature has a status, then resolves.
 *
 * Polls are serial: the next request is only scheduled once the previous one has
 * settled, so a slow RPC cannot stack up overlapping requests. If a request fails,
 * the returned promise rejects with that error instead of staying pending forever.
 *
 * @param connection - The connection used to fetch the signature status.
 * @param signature - The transaction signature to wait for.
 */
export async function waitForSignatureConfirmation(
  connection: Connection,
  signature: TransactionSignature
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    async function poll() {
      try {
        const status = await connection.getSignatureStatus(signature)

        if (status?.value) {
          resolve()

          return
        }

        setTimeout(poll, 1000)
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Signature status request failed'))
      }
    }

    setTimeout(poll, 1000)
  })
}
