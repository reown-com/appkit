import { ClientCtrl } from '@web3modal/core'
import { createSignal, onCleanup } from 'solid-js'

export function useClientInitialized() {
  const [initialized, setInitialized] = createSignal(ClientCtrl.state.initialized)

  const unsubscribe = ClientCtrl.subscribe(newClient => setInitialized(newClient.initialized))
  onCleanup(() => unsubscribe())

  return initialized
}
