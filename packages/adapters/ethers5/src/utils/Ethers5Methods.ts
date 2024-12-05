/* eslint-disable max-params */
import { ethers, Contract } from 'ethers'
import { type Provider } from '@reown/appkit-utils/ethers'
import type {
  EstimateGasTransactionArgs,
  SendTransactionArgs,
  WriteContractArgs
} from '@reown/appkit-core'
import { isReownName, type CaipNetwork } from '@reown/appkit-common'
import { WcHelpersUtil } from '@reown/appkit'

export const Ethers5Methods = {
  signMessage: async (message: string, provider: Provider, address: string) => {
    if (!provider) {
      throw new Error('signMessage - provider is undefined')
    }
    const hexMessage = ethers.utils.isHexString(message)
      ? message
      : ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message))
    const signature = await provider.request({
      method: 'personal_sign',
      params: [hexMessage, address]
    })

    return signature as `0x${string}`
  },

  estimateGas: async (
    data: EstimateGasTransactionArgs,
    provider: Provider,
    address: string,
    networkId: number
  ) => {
    if (!provider) {
      throw new Error('estimateGas - provider is undefined')
    }
    if (!address) {
      throw new Error('estimateGas - address is undefined')
    }

    if (data.chainNamespace && data.chainNamespace !== 'eip155') {
      throw new Error('estimateGas - chainNamespace is not eip155')
    }

    const txParams = {
      from: data.address,
      to: data.to,
      data: data.data,
      type: 0
    }

    const browserProvider = new ethers.providers.Web3Provider(provider, networkId)
    const signer = browserProvider.getSigner(address)

    return (await signer.estimateGas(txParams)).toBigInt()
  },

  sendTransaction: async (
    data: SendTransactionArgs,
    provider: Provider,
    address: string,
    networkId: number
  ) => {
    if (!provider) {
      throw new Error('sendTransaction - provider is undefined')
    }
    if (!address) {
      throw new Error('sendTransaction - address is undefined')
    }
    if (data.chainNamespace && data.chainNamespace !== 'eip155') {
      throw new Error('sendTransaction - chainNamespace is not eip155')
    }
    const txParams = {
      to: data.to,
      value: data.value,
      gasLimit: data.gas,
      gasPrice: data.gasPrice,
      data: data.data,
      type: 0
    }
    const browserProvider = new ethers.providers.Web3Provider(provider, networkId)
    const signer = browserProvider.getSigner(address)
    const txResponse = await signer.sendTransaction(txParams)
    const txReceipt = await txResponse.wait()

    return (txReceipt?.blockHash as `0x${string}`) || null
  },

  writeContract: async (
    data: WriteContractArgs,
    provider: Provider,
    address: string,
    chainId: number
  ) => {
    if (!provider) {
      throw new Error('writeContract - provider is undefined')
    }
    if (!address) {
      throw new Error('writeContract - address is undefined')
    }
    const browserProvider = new ethers.providers.Web3Provider(provider, chainId)
    const signer = browserProvider.getSigner(address)
    const contract = new Contract(data.tokenAddress, data.abi, signer)
    if (!contract || !data.method) {
      throw new Error('Contract method is undefined')
    }
    const method = contract[data.method]
    if (method) {
      return await method(data.receiverAddress, data.tokenAmount)
    }
    throw new Error('Contract method is undefined')
  },

  getEnsAddress: async (value: string, caipNetwork: CaipNetwork) => {
    try {
      const chainId = Number(caipNetwork.id)
      let ensName: string | null = null
      let wcName: boolean | string = false

      if (isReownName(value)) {
        wcName = (await WcHelpersUtil.resolveReownName(value)) || false
      }

      if (chainId === 1) {
        const ensProvider = new ethers.providers.InfuraProvider('mainnet')
        ensName = await ensProvider.resolveName(value)
      }

      return ensName || wcName || false
    } catch {
      return false
    }
  },

  getEnsAvatar: async (value: string, chainId: number) => {
    if (chainId === 1) {
      const ensProvider = new ethers.providers.InfuraProvider('mainnet')
      const avatar = await ensProvider.getAvatar(value)

      return avatar || false
    }

    return false
  },

  parseWalletCapabilities: (str: string) => {
    try {
      return JSON.parse(str)
    } catch (error) {
      throw new Error('Error parsing wallet capabilities')
    }
  },

  parseUnits: (value: string, _: number) => ethers.utils.parseUnits(value, 'gwei').toBigInt(),
  formatUnits: ethers.utils.formatUnits
}
