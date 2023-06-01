import type { Web3ModalSignDisconnectArguments } from '@web3modal/sign-html'
import { emitter, getWeb3ModalSignClient } from '../client'
import { useAsyncAction } from './_useAsyncAction'

export function useDisconnect(params: Web3ModalSignDisconnectArguments) {
  const { error, loading, setError, setLoading } = useAsyncAction()

  async function disconnect(paramsOverride?: Web3ModalSignDisconnectArguments) {
    try {
      setLoading(true)
      setError(undefined)
      const client = await getWeb3ModalSignClient()
      await client.disconnect(paramsOverride ?? params)
      emitter.emit('session_change')
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { error, loading, disconnect }
}
