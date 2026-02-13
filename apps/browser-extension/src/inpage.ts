import { registerWallet } from '@wallet-standard/core'
import { announceProvider } from 'mipd'
import { v4 as uuidv4 } from 'uuid'

import { BitcoinProvider } from './core/BitcoinProvider'
import { EvmProvider } from './core/EvmProvider'
import { SolanaProvider } from './core/SolanaProvider'
import { TonProvider } from './core/TonProvider'
import { TronProvider } from './core/TronProvider'
import { ConstantsUtil } from './utils/ConstantsUtil'

const evmProvider = new EvmProvider()
const solanaProvider = new SolanaProvider()
const bitcoinProvider = new BitcoinProvider()
const tonProvider = new TonProvider()
const tronProvider = new TronProvider()

// Inject TON provider into window for TonConnect
;(
  window as unknown as {
    reownTon: { tonconnect: ReturnType<TonProvider['createTonConnectInterface']> }
  }
).reownTon = {
  tonconnect: tonProvider.createTonConnectInterface(ConstantsUtil.IconRaw)
}

/*
 * Inject TRON provider at all three locations TronLinkAdapter checks:
 * 1. window.tron (TIP-1193 protocol) — checked by supportTron()
 * 2. window.tronLink — checked by supportTronLink() and _updateWallet()
 * 3. window.tronWeb — fallback for legacy detection
 */
;(window as unknown as Record<string, unknown>).tron = tronProvider
;(window as unknown as Record<string, unknown>).tronLink = tronProvider
;(window as unknown as Record<string, unknown>).tronWeb = tronProvider.tronWeb

announceProvider({
  info: {
    icon: ConstantsUtil.IconRaw as `data:image/${string}`,
    name: 'Reown',
    rdns: 'reown.com',
    uuid: uuidv4()
  },
  // We can fix type errors by providing all RPC methods to ReownEvmProvider (EIP1193 provider)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  provider: evmProvider
})

registerWallet(solanaProvider)
registerWallet(bitcoinProvider)
