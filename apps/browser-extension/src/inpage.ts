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
 * Inject TRON provider in a unique namespace to avoid conflicts with TronLink.
 * ReownTronAdapter will check window.reownTron specifically.
 */
;(window as unknown as Record<string, unknown>).reownTron = tronProvider

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
