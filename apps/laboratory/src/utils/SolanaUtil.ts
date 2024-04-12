import { SolanaConstantsUtil } from './SolanaConstants'

export function deserializeCounterAccount(data?: Buffer): { count: number } {
  if (data?.byteLength !== 8) {
    throw Error('Need exactly 8 bytes to deserialize counter')
  }

  return {
    count: Number(data[0])
  }
}

export function detectProgramId(chainId: string): string {
  return SolanaConstantsUtil.programIds.find(chain => chain.chainId === chainId)?.programId ?? ''
}
