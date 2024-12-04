import { announceProvider } from 'mipd'
import { ConstantsUtil } from './utils/ConstantsUtil'
import { v4 as uuidv4 } from 'uuid'
import { registerWallet } from '@wallet-standard/core'
import { ReownEvmProvider } from './core/ReownEvmProvider'
import { ReownSolanaProvider } from './core/ReownSolanaProvider'

const reownEvmProvider = new ReownEvmProvider()
const reownSolanaProvider = new ReownSolanaProvider()

announceProvider({
  info: {
    icon: ConstantsUtil.IconRaw,
    name: 'Reown',
    rdns: 'reown.com',
    uuid: uuidv4()
  },
  provider: reownEvmProvider
})

registerWallet(reownSolanaProvider)
