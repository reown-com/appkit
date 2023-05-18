import type { Web3ModalSignRequestArguments } from '@web3modal/sign-html'
import { getWeb3ModalSignClient } from '../client'
import { useAsyncAction } from './_useAsyncAction'

export function useRequest<Result>(params: Web3ModalSignRequestArguments) {
  const { data, error, loading, setData, setError, setLoading } = useAsyncAction<Result>()

  async function request(paramsOverride?: Web3ModalSignRequestArguments) {
    try {
      setLoading(true)
      setError(undefined)
      const client = await getWeb3ModalSignClient()
      const response = await client.request<Result>(paramsOverride ?? params)
      setData(response)

      return response
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { data, error, loading, request }
}
