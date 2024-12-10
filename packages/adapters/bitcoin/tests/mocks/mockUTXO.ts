import type { BitcoinApi } from '../../src/utils/BitcoinApi.js'

export function mockUTXO(replaces: Partial<BitcoinApi.UTXO> = {}): BitcoinApi.UTXO {
  return {
    txid: 'mock_txid',
    vout: 0,
    value: 1000,
    status: {
      confirmed: true,
      block_height: 1,
      block_hash: 'mock_block_hash',
      block_time: 1
    },
    ...replaces
  }
}
