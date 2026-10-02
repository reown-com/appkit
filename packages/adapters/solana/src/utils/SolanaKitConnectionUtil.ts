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

export async function waitForSignatureConfirmationKit(
  rpc: Rpc,
  signature: Signature
): Promise<void> {
  await new Promise<void>(resolve => {
    const interval = setInterval(async () => {
      const { value } = await rpc.getSignatureStatuses([signature]).send()

      if (value[0]) {
        clearInterval(interval)
        resolve()
      }
    }, 1000)
  })
}
