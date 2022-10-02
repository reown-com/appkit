import type { GetContractOpts } from '@web3modal/ethereum'
import { useContract } from './useContract'

interface ListenerOpts {
  event: string
  handler: (args: unknown[]) => void
  once: boolean
}

type UseContractOpts = GetContractOpts & ListenerOpts

export function useContractEvent(opts: UseContractOpts) {
  const { handler, once, event, addressOrName, contractInterface, signerOrProvider } = opts
  const { contract } = useContract({ addressOrName, contractInterface, signerOrProvider })

  const validContract = contract()

  if (validContract !== null)
    if (once) validContract.once(event, handler)
    else validContract.on(event, handler)
}
