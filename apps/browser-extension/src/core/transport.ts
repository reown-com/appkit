import { createWalletClient, EIP1193Parameters, EIP1193Provider, fromHex, http, toHex } from 'viem'
import { ChainId, wagmiConfig } from './wagmi'
import { AccountUtil } from '../utils/AccountUtil'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import { getPublicClient } from '@wagmi/core'

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

      const chainId = (localStorage.getItem('chainId') as ChainId | null) ?? '1'
      const hasConnected = localStorage.getItem('hasConnected')

      const publicClient = getPublicClient(wagmiConfig, { chainId: chainId as ChainId })

      switch (method) {
        case 'eth_chainId':
          return toHex(Number(chainId))

        case 'eth_estimateGas': {
          const gas = await publicClient.estimateGas(params[0])

          return toHex(gas)
        }

        case 'eth_blockNumber': {
          const blockNumber = await publicClient.getBlockNumber()

          return toHex(blockNumber)
        }

        case 'eth_call':
          return publicClient.call(params[0])

        case 'eth_requestAccounts':
          localStorage.setItem('hasConnected', 'true')

          return [address]

        case 'eth_accounts':
          return hasConnected ? [address] : []

        case 'wallet_switchEthereumChain':
          localStorage.setItem('chainId', fromHex(params[0].chainId, 'number').toString())

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
