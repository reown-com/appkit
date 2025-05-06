import { getPublicClient } from '@wagmi/core'
import { EIP1193Parameters, EIP1193Provider, createWalletClient, fromHex, http, toHex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

import { AccountUtil } from '../utils/AccountUtil'
import { ChainId, wagmiConfig } from './wagmi'

// -- Constants -----------------------------------------------------------------
const LOCAL_STORAGE_KEYS = {
  HAS_CONNECTED: '@appkit/extension_connected',
  CHAIN_ID: '@appkit/extension_chain_id'
}

export function createReownTransport() {
  return {
    send: async ({
      method,
      params
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }: EIP1193Parameters<any>): Promise<ReturnType<EIP1193Provider['request']>> => {
      const account = privateKeyToAccount(AccountUtil.privateKeyEvm)
      const { address, signMessage, signTypedData } = account

      const { sendTransaction } = createWalletClient({
        account,
        chain: sepolia,
        transport: http()
      })

      const chainId = (localStorage.getItem(LOCAL_STORAGE_KEYS.CHAIN_ID) as ChainId | null) ?? '1'
      const hasConnected = localStorage.getItem(LOCAL_STORAGE_KEYS.HAS_CONNECTED)

      const publicClient = getPublicClient(wagmiConfig, { chainId: chainId as ChainId })

      switch (method) {
        case 'eth_chainId':
          return toHex(Number(chainId))

        case 'eth_estimateGas': {
          const gas = await publicClient?.estimateGas(params[0])

          return toHex(gas)
        }

        case 'eth_blockNumber': {
          const blockNumber = await publicClient?.getBlockNumber()

          return toHex(blockNumber)
        }

        case 'eth_call':
          return publicClient?.call(params[0])

        case 'eth_requestAccounts':
          localStorage.setItem(LOCAL_STORAGE_KEYS.HAS_CONNECTED, 'true')

          return [address]

        case 'eth_accounts':
          return hasConnected ? [address] : []

        case 'wallet_switchEthereumChain':
          localStorage.setItem(
            LOCAL_STORAGE_KEYS.CHAIN_ID,
            fromHex(params[0].chainId, 'number').toString()
          )

          return null

        case 'personal_sign': {
          const [message] = params

          return signMessage({
            message: { raw: message }
          })
        }

        case 'eth_sendTransaction': {
          const [{ to, value }] = params

          const hash = await sendTransaction({
            to,
            value: BigInt(value)
          })

          return hash
        }

        case 'eth_signTypedData_v4': {
          const [, typedData] = params

          return signTypedData(JSON.parse(typedData))
        }

        default:
          throw new Error(`Method not implemented: ${method}`)
      }
    }
  }
}
