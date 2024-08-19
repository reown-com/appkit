import type { ProviderEventEmitterMethods } from '../../utils/scaffold/index.js'

type Listeners = {
  [Event in ProviderEventEmitterMethods.Event]: Array<
    (arg: ProviderEventEmitterMethods.EventParams[Event]) => void
  >
}

export abstract class ProviderEventEmitter implements ProviderEventEmitterMethods {
  private listeners: Listeners = {
    accountsChanged: [],
    chainChanged: [],
    connect: [],
    disconnect: []
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
