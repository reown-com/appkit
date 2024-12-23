import type { CaipNetwork } from '@reown/appkit-common'
import { bitcoinTestnet } from '@reown/appkit/networks'

export const BitcoinApi: BitcoinApi.Interface = {
  getUTXOs: async ({ network, address }: BitcoinApi.GetUTXOsParams): Promise<BitcoinApi.UTXO[]> => {
    const isTestnet = network.caipNetworkId === bitcoinTestnet.caipNetworkId
    // Make chain dynamic

    const response = await fetch(
      `https://mempool.space${isTestnet ? '/testnet' : ''}/api/address/${address}/utxo`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch UTXOs: ${await response.text()}`)
    }

    return (await response.json()) as BitcoinApi.UTXO[]
  }
}

export namespace BitcoinApi {
  export type Interface = {
    getUTXOs: (params: GetUTXOsParams) => Promise<UTXO[]>
  }

  export type GetUTXOsParams = {
    network: CaipNetwork
    address: string
  }

  export type UTXO = {
    txid: string
    vout: number
    value: number
    status: {
      confirmed: boolean
      block_height: number
      block_hash: string
      block_time: number
    }
  }
}
