import type { ProviderEventEmitterMethods } from '@reown/appkit-utils/solana'

type Listeners = {
  [Event in ProviderEventEmitterMethods.Event]: Array<
    (arg: ProviderEventEmitterMethods.EventParams[Event]) => void
  >
}

export class ProviderEventEmitter implements ProviderEventEmitterMethods {
  private listeners: Listeners = {
    accountsChanged: [],
    chainChanged: [],
    connect: [],
    disconnect: [],
    pendingTransaction: [],
    auth_rpcRequest: [],
    auth_rpcSuccess: [],
    auth_rpcError: []
  }

  public on<E extends ProviderEventEmitterMethods.Event>(
    event: E,
    listener: (data: ProviderEventEmitterMethods.EventParams[E]) => void
  ) {
    this.listeners[event].push(listener)
  }

  public removeListener<E extends ProviderEventEmitterMethods.Event>(
    event: E,
    listener: (data: ProviderEventEmitterMethods.EventParams[E]) => void
  ) {
    this.listeners[event] = this.listeners[event].filter(l => l !== listener) as Listeners[E]
  }

  public emit<E extends ProviderEventEmitterMethods.Event>(
    event: E,
    data: ProviderEventEmitterMethods.EventParams[E]
  ) {
    this.listeners[event].forEach(listener => listener(data))
  }
}
