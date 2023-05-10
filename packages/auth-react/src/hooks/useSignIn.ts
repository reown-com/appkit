import type { Web3ModalAuthSignInArguments } from '@web3modal/auth-html'
import { getWeb3ModalAuthClient } from '../client'

export function useSignIn(params: Web3ModalAuthSignInArguments) {
  async function signIn(paramsOverride?: Web3ModalAuthSignInArguments) {
    const client = await getWeb3ModalAuthClient()

    return client.signIn(paramsOverride ?? params)
  }

  return signIn
}
