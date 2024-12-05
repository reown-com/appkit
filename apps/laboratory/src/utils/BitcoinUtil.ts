import type { BitcoinConnector } from '@reown/appkit-adapter-bitcoin'
import type { CaipNetwork, CaipNetworkId } from '@reown/appkit'
import * as networks from '@reown/appkit/networks'
import * as bitcoin from 'bitcoinjs-lib'

export const BitcoinUtil = {
  createSignPSBTParams(params: BitcoinUtil.CreateSignPSBTParams): BitcoinConnector.SignPSBTParams {
    const network = this.getBitcoinNetwork(params.network.caipNetworkId)

    const psbt = new bitcoin.Psbt({ network })
    const payment = bitcoin.payments.p2wpkh({ address: params.senderAddress, network })

    if (!payment.output) {
      throw new Error('Invalid payment output')
    }

    const change = this.calculateChange(params.utxos, params.amount, params.feeRate)

    if (change < 0) {
      throw new Error('Insufficient funds')
    } else if (change > 0) {
      psbt.addOutput({
        address: params.senderAddress,
        value: BigInt(change)
      })
    }

    for (const utxo of params.utxos) {
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: payment.output,
          value: BigInt(utxo.value)
        }
      })
    }

    psbt.addOutput({
      address: params.recipientAddress,
      value: BigInt(params.amount)
    })

    if (params.memo) {
      const data = Buffer.from(params.memo, 'utf8')
      const embed = bitcoin.payments.embed({ data: [data] })

      if (!embed.output) {
        throw new Error('Invalid embed output')
      }

      psbt.addOutput({
        script: embed.output,
        value: BigInt(0)
      })
    }

    return {
      psbt: psbt.toBase64(),
      signInputs: [],
      broadcast: false
    }
  },

  async getUTXOs(address: string, networkId: CaipNetworkId): Promise<BitcoinUtil.UTXO[]> {
    const isTestnet = this.isTestnet(networkId)
    // Make chain dynamic

    const response = await fetch(
      `https://mempool.space${isTestnet ? '/testnet' : ''}/api/address/${address}/utxo`
    )

    return await response.json()
  },

  async getFeeRate() {
    const defaultFeeRate = 2
    try {
      const response = await fetch('https://mempool.space/api/v1/fees/recommended')
      if (response.ok) {
        const data = await response.json()

        if (data?.fastestFee) {
          return parseInt(data.fastestFee, 10)
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error fetching fee rate', e)
    }

    return defaultFeeRate
  },

  calculateChange(utxos: BitcoinUtil.UTXO[], amount: number, feeRate: number): number {
    const inputSum = utxos.reduce((sum, utxo) => sum + utxo.value, 0)
    /**
     * 10 bytes: This is an estimated fixed overhead for the transaction.
     * 148 bytes: This is the average size of each input (UTXO).
     * 34 bytes: This is the size of each output.
     * The multiplication by 2 indicates that there are usually two outputs in a typical transaction (one for the recipient and one for change)
     */
    const estimatedSize = 10 + 148 * utxos.length + 34 * 2
    const fee = estimatedSize * feeRate
    const change = inputSum - amount - fee

    return change
  },

  isTestnet(networkId: CaipNetworkId): boolean {
    return networkId === networks.bitcoinTestnet.caipNetworkId
  },

  getBitcoinNetwork(networkId: CaipNetworkId): bitcoin.Network {
    return this.isTestnet(networkId) ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
  }
}

export namespace BitcoinUtil {
  export type CreateSignPSBTParams = {
    senderAddress: string
    recipientAddress: string
    network: CaipNetwork
    amount: number
    utxos: UTXO[]
    feeRate: number
    memo?: string
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
