import type { Web3ModalSignConnectArguments } from '@web3modal/sign-html'
import { getWeb3ModalSignClient } from '../client'

export function useConnect(params: Web3ModalSignConnectArguments) {
  async function connect(paramsOverride?: Web3ModalSignConnectArguments) {
    const client = await getWeb3ModalSignClient()

    return client.connect(paramsOverride ?? params)
  }

  return connect
}
