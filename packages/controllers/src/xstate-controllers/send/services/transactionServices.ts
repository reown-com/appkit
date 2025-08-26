import { fromPromise } from 'xstate'

import type { Address, Balance, CaipAddress } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil, ContractUtil } from '@reown/appkit-common'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { ChainController } from '../../../controllers/ChainController.js'
import { ConnectionController } from '../../../controllers/ConnectionController.js'
import { EventsController } from '../../../controllers/EventsController.js'
import { RouterController } from '../../../controllers/RouterController.js'
import { getPreferredAccountType } from '../../../utils/ChainControllerUtil.js'
import { CoreHelperUtil } from '../../../utils/CoreHelperUtil.js'
import type { TransactionInput, TransactionOutput } from '../types/sendTypes.js'

export const transactionService = fromPromise(
  async ({ input }: { input: TransactionInput }): Promise<TransactionOutput> => {
    const { type, token, amount, to, fromAddress, chainNamespace } = input

    if (!amount || !to || !fromAddress) {
      throw new Error('Amount, recipient address, and sender address are required')
    }

    let hash = ''

    const activeAccountType = getPreferredAccountType(chainNamespace)
    EventsController.sendEvent({
      type: 'track',
      event: 'SEND_INITIATED',
      properties: {
        isSmartAccount: activeAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
        token: token?.address || token?.symbol || 'native',
        amount,
        network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
      }
    })

    RouterController.pushTransactionStack({
      onSuccess() {
        RouterController.replace('Account')
      }
    })

    try {
      if (type === 'evm') {
        hash = await sendEvmTransaction({ token, amount, to, fromAddress })
      } else if (type === 'solana') {
        hash = await sendSolanaTransaction({ amount, to })
      } else {
        throw new Error(`Unsupported transaction type: ${type}`)
      }

      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_SUCCESS',
        properties: {
          isSmartAccount: activeAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
          token: token?.symbol || 'native',
          amount,
          network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
        }
      })

      ConnectionController._getClient()?.updateBalance(chainNamespace)

      return {
        hash,
        success: true
      }
    } catch (error) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_ERROR',
        properties: {
          message: error instanceof Error ? error.message : 'Unknown error',
          isSmartAccount: activeAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
          token: token?.symbol || 'native',
          amount,
          network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
        }
      })

      throw error
    }
  }
)

async function sendEvmTransaction({
  token,
  amount,
  to,
  fromAddress
}: {
  token?: Balance
  amount: number
  to: string
  fromAddress: string
}): Promise<string> {
  if (token?.address) {
    const parsedAmount = ConnectionController.parseUnits(
      amount.toString(),
      Number(token.quantity.decimals)
    )

    const tokenAddress = CoreHelperUtil.getPlainAddress(token.address as CaipAddress)

    if (!tokenAddress) {
      throw new Error('Invalid token address')
    }

    const result = await ConnectionController.writeContract({
      fromAddress: fromAddress as Address,
      tokenAddress,
      args: [to as Address, parsedAmount ?? BigInt(0)],
      method: 'transfer',
      abi: ContractUtil.getERC20Abi(tokenAddress),
      chainNamespace: CommonConstantsUtil.CHAIN.EVM
    })

    return typeof result === 'string'
      ? result
      : (result as unknown as { hash?: string })?.hash || ''
  }

  const value = ConnectionController.parseUnits(
    amount.toString(),
    Number(token?.quantity?.decimals || '18')
  )

  const result = await ConnectionController.sendTransaction({
    chainNamespace: CommonConstantsUtil.CHAIN.EVM,
    to: to as Address,
    address: fromAddress as Address,
    data: '0x',
    value: value ?? BigInt(0)
  })

  return typeof result === 'string' ? result : (result as unknown as { hash?: string })?.hash || ''
}

async function sendSolanaTransaction({
  amount,
  to
}: {
  amount: number
  to: string
}): Promise<string> {
  const result = await ConnectionController.sendTransaction({
    chainNamespace: 'solana',
    to,
    value: amount
  })

  return typeof result === 'string' ? result : (result as unknown as { hash?: string })?.hash || ''
}
