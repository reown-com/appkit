import type { Address, Blockhash, Lamports, Signature } from '@solana/kit'

import type { Rpc } from '@reown/appkit-utils/solana'

export async function getBalanceKit(rpc: Rpc, address: Address): Promise<Lamports> {
  const { value } = await rpc.getBalance(address).send()

  return value
}

export async function getLatestBlockhashKit(
  rpc: Rpc
): Promise<{ blockhash: Blockhash; lastValidBlockHeight: bigint }> {
  const { value } = await rpc.getLatestBlockhash().send()

  return value
}

/**
 * Polls the RPC until the given signature has a status, then resolves.
 *
 * Polls are serial: the next request is only scheduled once the previous one has
 * settled, so a slow RPC cannot stack up overlapping requests. If a request fails,
 * the returned promise rejects with that error instead of staying pending forever.
 *
 * @param rpc - The RPC client used to fetch the signature status.
 * @param signature - The transaction signature to wait for.
 */
export async function waitForSignatureConfirmationKit(
  rpc: Rpc,
  signature: Signature
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    async function poll() {
      try {
        const { value } = await rpc.getSignatureStatuses([signature]).send()

        if (value[0]) {
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
