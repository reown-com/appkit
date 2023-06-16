import type { Web3ModalAuthSignInArguments } from '@web3modal/auth-html'
import type { Web3ModalAuthInstance } from '../client'
import { getWeb3ModalAuthClient } from '../client'
import { useAsyncAction } from './_useAsyncAction'

type Data = Awaited<ReturnType<Web3ModalAuthInstance['signIn']>>

export function useSignIn(params: Web3ModalAuthSignInArguments) {
  const { data, error, loading, setData, setError, setLoading } = useAsyncAction<Data>()

  async function signIn(paramsOverride?: Web3ModalAuthSignInArguments) {
    try {
      setLoading(true)
      setError(undefined)
      const client = await getWeb3ModalAuthClient()
      const response = await client.signIn(paramsOverride ?? params)
      setData(response)

      return response
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { signIn, data, error, loading }
}
