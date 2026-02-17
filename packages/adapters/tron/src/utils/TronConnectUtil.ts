import type { Adapter } from '@tronweb3/tronwallet-abstract-adapter'
import { WalletReadyState } from '@tronweb3/tronwallet-abstract-adapter'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink'

import { CoreHelperUtil } from '@reown/appkit-controllers'

/**
 * Validate that a "Found" adapter is genuinely the wallet it claims to be.
 * Some wallets (e.g. Klever) inject at window.tronLink for compatibility,
 * causing TronLinkAdapter to report "Found" even though TronLink isn't installed.
 * We check wallet-specific window markers to filter impersonators.
 */
function isGenuineAdapter(adapter: Adapter): boolean {
  const w = CoreHelperUtil.getWindow() as unknown as Record<string, unknown>

  if (adapter instanceof TronLinkAdapter) {
    /*
     * Check for genuine TronLink or compatible wallets (like Reown)
     * Real TronLink (v3.22+) sets window.tron.isTronLink = true
     */
    const tron = w['tron'] as { isTronLink?: boolean } | undefined
    const tronLink = w['tronLink'] as { ready?: boolean } | undefined

    /*
     * Accept if:
     * 1. window.tron.isTronLink is true (TronLink standard), OR
     * 2. window.tronLink exists and has ready property (compatible wallet like Reown)
     */
    const hasTronStandard = tron?.isTronLink === true
    const hasCompatibleWallet = tronLink?.ready === true

    return hasTronStandard || hasCompatibleWallet
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
   *
   * @param adapters - Array of TRON wallet adapter instances to watch
   * @param onFound - Callback invoked when a wallet adapter becomes available
   * @returns Cleanup function to stop listening
   */
  watchWalletAdapters(adapters: Adapter[], onFound: (adapter: Adapter) => void): () => void {
    if (!CoreHelperUtil.isClient()) {
      return () => {
        // No-op cleanup for non-client environments
      }
    }

    // eslint-disable-next-line no-console
    console.log('[TronConnectUtil] Watching wallet adapters:', {
      count: adapters.length,
      adapters: adapters.map(a => ({
        name: a.name || a.constructor.name,
        readyState: a.readyState,
        isGenuine: isGenuineAdapter(a)
      }))
    })

    const cleanups: (() => void)[] = []

    for (const adapter of adapters) {
      if (adapter.readyState === WalletReadyState.Found) {
        if (isGenuineAdapter(adapter)) {
          onFound(adapter)
        } else {
          // eslint-disable-next-line no-console
          console.log('[TronConnectUtil] Adapter not genuine, skipping:', adapter.name)
        }
      } else if (adapter.readyState === WalletReadyState.Loading) {
        // eslint-disable-next-line no-console
        console.log('[TronConnectUtil] Adapter loading, listening for ready:', adapter.name)
        listenForReady(adapter, onFound, cleanups)
      }
    }

    return () => cleanups.forEach(fn => fn())
  }
}
