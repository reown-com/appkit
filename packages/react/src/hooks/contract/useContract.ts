import { ClientCtrl } from '@web3modal/core'

// -- utilities ---------------------------------------------------- //
const { getContract } = ClientCtrl.ethereum()
type Options = Parameters<typeof getContract>[0]

// -- hook --------------------------------------------------------- //
export function useContract(options: Options) {
  return getContract(options)
}
