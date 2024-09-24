import { erc20ABI } from '../contracts/erc20.js'
import { usdtABI } from '../contracts/usdt.js'
import { ConstantsUtil } from './ConstantsUtil.js'

export const ContractUtil = {
  getERC20Abi: (tokenAddress: string) => {
    switch (tokenAddress) {
      case ConstantsUtil.USDT_CONTRACT_ADDRESS:
        return usdtABI
      default:
        return erc20ABI
    }
  }
}
