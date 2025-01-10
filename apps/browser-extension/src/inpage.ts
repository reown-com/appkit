import { announceProvider } from 'mipd'
import { ConstantsUtil } from './utils/ConstantsUtil'
import { v4 as uuidv4 } from 'uuid'
import { registerWallet } from '@wallet-standard/core'
import { EvmProvider } from './core/EvmProvider'
import { SolanaProvider } from './core/SolanaProvider'

const evmProvider = new EvmProvider()
const solanaProvider = new SolanaProvider()

announceProvider({
  info: {
    icon: ConstantsUtil.IconRaw,
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
