import { registerWallet } from '@wallet-standard/core'
import { announceProvider } from 'mipd'
import { v4 as uuidv4 } from 'uuid'

import { EvmProvider } from './core/EvmProvider'
import { SolanaProvider } from './core/SolanaProvider'
import { ConstantsUtil } from './utils/ConstantsUtil'

const evmProvider = new EvmProvider()
const solanaProvider = new SolanaProvider()

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
