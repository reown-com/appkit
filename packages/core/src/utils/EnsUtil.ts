const SLIP44_MSB = 0x80000000

export const EnsUtil = {
  convertEVMChainIdToCoinType(chainId: number): number {
    if (chainId >= SLIP44_MSB) {
      throw new Error('Invalid chainId')
    }

    return (SLIP44_MSB | chainId) >>> 0
  }
}
