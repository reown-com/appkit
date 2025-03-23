import { useAppKit } from '@reown/appkit/react'

export type SwapParams = {
  action: string
  sourceToken: string
  toToken: string
  amount: string
  chainId: string
}

export type SendParams = {
  action: string
  sourceToken: string
  address: string
  amount: string
  chainId: string
}

type Arguments = SendParams | SwapParams

export function useAppKitActions() {
  const { open } = useAppKit()

  function handleAppKitAction(args: Arguments) {
    console.log('handleAppKitAction', args)
    switch (args.action) {
      case 'send':
        open({
          view: 'WalletSend',
          data: {
            sendParams: {
              sourceToken: (args as SendParams).sourceToken,
              address: (args as SendParams).address,
              amount: (args as SendParams).amount,
              chainId: (args as SendParams).chainId
            }
          }
        })
        break
      case 'swap':
        open({
          view: 'Swap',
          data: {
            swapParams: {
              sourceToken: (args as SwapParams).sourceToken,
              toToken: (args as SwapParams).toToken,
              amount: (args as SwapParams).amount,
              chainId: (args as SwapParams).chainId
            }
          }
        })
        break
      default:
        break
    }
  }

  return { handleAppKitAction }
}
