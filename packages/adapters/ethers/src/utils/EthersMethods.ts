/* eslint-disable max-params */
import {
  BrowserProvider,
  Contract,
  JsonRpcSigner,
  InfuraProvider,
  isHexString,
  hexlify,
  toUtf8Bytes,
  parseUnits,
  formatUnits
} from 'ethers'
import { type Provider } from '@web3modal/scaffold-utils/ethers'
import type {
  EstimateGasTransactionArgs,
  SendTransactionArgs,
  WriteContractArgs
} from '@web3modal/core'
import { ConstantsUtil } from '@web3modal/common'
import type { AppKit } from '@web3modal/base'

export const EthersMethods = {
  signMessage: async (message: string, provider: Provider, address: string) => {
    if (!provider) {
      throw new Error('signMessage - provider is undefined')
    }
    const hexMessage = isHexString(message) ? message : hexlify(toUtf8Bytes(message))
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
    const txParams = {
      from: data.address,
      to: data.to,
      data: data.data,
      type: 0
    }
    const browserProvider = new BrowserProvider(provider, networkId)
    const signer = new JsonRpcSigner(browserProvider, address)

    return await signer.estimateGas(txParams)
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
    const txParams = {
      to: data.to,
      value: data.value,
      gasLimit: data.gas,
      gasPrice: data.gasPrice,
      data: data.data,
      type: 0
    }
    const browserProvider = new BrowserProvider(provider, networkId)
    const signer = new JsonRpcSigner(browserProvider, address)
    const txResponse = await signer.sendTransaction(txParams)
    const txReceipt = await txResponse.wait()

    return (txReceipt?.hash as `0x${string}`) || null
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
    const browserProvider = new BrowserProvider(provider, chainId)
    const signer = new JsonRpcSigner(browserProvider, address)
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

  getEnsAddress: async (value: string, appKit: AppKit) => {
    try {
      const chainId = Number(appKit.getCaipNetwork()?.id)
      let ensName: string | null = null
      let wcName: boolean | string = false

      if (value?.endsWith(ConstantsUtil.WC_NAME_SUFFIX)) {
        wcName = (await appKit?.resolveWalletConnectName(value)) || false
      }

      if (chainId === 1) {
        const ensProvider = new InfuraProvider('mainnet')
        ensName = await ensProvider.resolveName(value)
      }

      return ensName || wcName || false
    } catch {
      return false
    }
  },

  getEnsAvatar: async (value: string, chainId: number) => {
    if (chainId === 1) {
      const ensProvider = new InfuraProvider('mainnet')
      const avatar = await ensProvider.getAvatar(value)

      return avatar || false
    }

    return false
  },

  parseUnits,
  formatUnits
}
