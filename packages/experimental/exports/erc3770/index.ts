import { ConverterUtil } from '../../src/erc3770/utils/ConverterUtil.js'

export function convertCaip10ToErc3770(caipAddress: string): string {
  return ConverterUtil.convertCaip10ToErc3770(caipAddress)
}

export function createErc3770Address(address: string, chainId: string): string {
  return ConverterUtil.createErc3770Address(address, chainId)
}
