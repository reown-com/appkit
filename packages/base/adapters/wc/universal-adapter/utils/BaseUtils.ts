import { BN } from 'bn.js'
import type { CaipAddress } from '@web3modal/core'
import UniversalProvider from '@walletconnect/universal-provider'
import { WcHelpersUtil } from '../../../../utils/HelpersUtil.js'

export const BaseUtils = {
  async getBalance(provider: UniversalProvider, caipAddress: CaipAddress, chain: 'evm' | 'solana') {
    const { chainType, chainId, address } = WcHelpersUtil.extractDetails(caipAddress)

    const balance = (await provider.request(
      { method: 'eth_getBalance', params: [address, 'latest'] },
      `${chainType}:${chainId}`
    )) as {
      value: number
    }
    const BALANCE_VALUE_DECIMAL_DIVIDER = 1000000000

    const value = new BN(balance.value)
    const currency = chain === 'evm' ? 'eth' : 'sol'
    const decimals = balance.value / BALANCE_VALUE_DECIMAL_DIVIDER
    const symbol = currency

    return {
      value,
      currency,
      formatted: `${balance.value} ${currency}`,
      decimals,
      symbol
    }
  }
}
