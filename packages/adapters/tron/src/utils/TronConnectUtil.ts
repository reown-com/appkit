import type { Adapter } from '@tronweb3/tronwallet-abstract-adapter'
import { WalletReadyState } from '@tronweb3/tronwallet-abstract-adapter'
import { BinanceWalletAdapter } from '@tronweb3/tronwallet-adapter-binance'
import { BitKeepAdapter } from '@tronweb3/tronwallet-adapter-bitkeep'
import { MetaMaskAdapter } from '@tronweb3/tronwallet-adapter-metamask-tron'
import { OkxWalletAdapter } from '@tronweb3/tronwallet-adapter-okxwallet'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink'
import { TrustAdapter } from '@tronweb3/tronwallet-adapter-trust'

import { CoreHelperUtil } from '@reown/appkit-controllers'

function createAdapters(): Adapter[] {
  if (!CoreHelperUtil.isClient()) {
    return []
  }

  return [
    new TronLinkAdapter({ openUrlWhenWalletNotFound: false, checkTimeout: 3000 }),
    new TrustAdapter(),
    new BitKeepAdapter(),
    new BinanceWalletAdapter(),
    new OkxWalletAdapter({ openUrlWhenWalletNotFound: false }),
    new MetaMaskAdapter()
  ]
}

/**
 * Validate that a "Found" adapter is genuinely the wallet it claims to be.
 * Some wallets (e.g. Klever) inject at window.tronLink for compatibility,
 * causing TronLinkAdapter to report "Found" even though TronLink isn't installed.
 * We check wallet-specific window markers to filter impersonators.
 */
function isGenuineAdapter(adapter: Adapter): boolean {
  const w = CoreHelperUtil.getWindow() as unknown as Record<string, unknown>

  if (adapter instanceof TronLinkAdapter) {
    // Real TronLink (v3.22+) sets window.tron.isTronLink = true
    const tron = w['tron'] as { isTronLink?: boolean } | undefined

    return tron?.isTronLink === true
  }

  return true
}

function listenForReady(
  adapter: Adapter,
  onFound: (adapter: Adapter) => void,
  cleanups: (() => void)[]
) {
  function handler(state: WalletReadyState) {
    if (state === WalletReadyState.Found && isGenuineAdapter(adapter)) {
      onFound(adapter)
      adapter.removeListener('readyStateChanged', handler)
    }
  }
  adapter.on('readyStateChanged', handler)
  cleanups.push(() => adapter.removeListener('readyStateChanged', handler))
}

export const TronConnectUtil = {
  /**
   * Watch for TRON wallet adapters and invoke callback when one becomes available.
   * Returns a cleanup function to stop listening.
   */
  watchWalletAdapters(onFound: (adapter: Adapter) => void): () => void {
    const adapters = createAdapters()
    const cleanups: (() => void)[] = []

    for (const adapter of adapters) {
      if (adapter.readyState === WalletReadyState.Found) {
        if (isGenuineAdapter(adapter)) {
          onFound(adapter)
        }
      } else if (adapter.readyState === WalletReadyState.Loading) {
        listenForReady(adapter, onFound, cleanups)
      }
    }

    return () => cleanups.forEach(fn => fn())
  }
}
