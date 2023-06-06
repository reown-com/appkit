import type { Web3ModalSignConnectArguments } from '@web3modal/sign-html'
import type { Web3ModalSignInstance } from '../client'
import { emitter, getWeb3ModalSignClient } from '../client'
import { useAsyncAction } from './_useAsyncAction'

type Data = Awaited<ReturnType<Web3ModalSignInstance['connect']>>

export function useConnect(params: Web3ModalSignConnectArguments) {
  const { data, error, loading, setData, setError, setLoading } = useAsyncAction<Data>()

  async function connect(paramsOverride?: Web3ModalSignConnectArguments) {
    try {
      setLoading(true)
      setError(undefined)
      const client = await getWeb3ModalSignClient()
      const response = await client.connect(paramsOverride ?? params)
      setData(response)
      emitter.emit('session_change')

      return response
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { data, error, loading, connect }
}
