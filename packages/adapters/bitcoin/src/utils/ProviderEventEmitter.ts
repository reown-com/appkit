import type { ProviderEventListener } from '@reown/appkit-core'

interface ProviderEventEmitterMethods {
  on: <E extends ProviderEventEmitterMethods.Event>(
    event: E,
    listener: ProviderEventListener[E]
  ) => void
  removeListener: <E extends ProviderEventEmitterMethods.Event>(
    event: E,
    listener: (data: ProviderEventEmitterMethods.EventParams[E]) => void
  ) => void
  emit: <E extends ProviderEventEmitterMethods.Event>(
    event: E,
    data: ProviderEventEmitterMethods.EventParams[E]
  ) => void
}
declare namespace ProviderEventEmitterMethods {
  type Event = keyof EventParams
  type EventParams = {
    connect: { chainId: string | number }
    disconnect: Error
    accountsChanged: string
    chainChanged: string
    display_uri: string
    message: { type: string; data: unknown }
  }
}

type Listeners = {
  [Event in ProviderEventEmitterMethods.Event]: Array<ProviderEventListener[Event]>
}
export class ProviderEventEmitter implements ProviderEventEmitterMethods {
  private listeners: Listeners = {
    accountsChanged: [],
    chainChanged: [],
    connect: [],
    disconnect: [],
    display_uri: [],
    message: []
  }

  on<
    T extends keyof {
      connect: (connectParams: { chainId: number }) => void
      disconnect: (error: Error) => void
      display_uri: (uri: string) => void
      chainChanged: (chainId: string) => void
      accountsChanged: (accounts: string[]) => void
      message: (message: { type: string; data: unknown }) => void
    }
  >(
    event: T,
    listener: {
      connect: (connectParams: { chainId: number }) => void
      disconnect: (error: Error) => void
      display_uri: (uri: string) => void
      chainChanged: (chainId: string) => void
      accountsChanged: (accounts: string[]) => void
      message: (message: { type: string; data: unknown }) => void
    }[T]
  ): void {
    console.log(event, listener)
    throw new Error('Method not implemented.')
  }

  removeListener<T extends ProviderEventEmitterMethods.Event>(
    event: T,
    listener: (data: ProviderEventEmitterMethods.EventParams[T]) => void
  ) {
    console.log(event, listener)
    throw new Error('Method not implemented.')
  }

  // public on<E extends ProviderEventEmitterMethods.Event>(
  //   event: E,
  //   listener: ProviderEventListener[E]
  // ) {
  //   this.listeners[event].push(listener)
  // }

  // public removeListener<E extends ProviderEventEmitterMethods.Event>(
  //   event: E,
  //   listener: ProviderEventListener[E]
  // ) {
  //   this.listeners[event] = this.listeners[event].filter(l => l !== listener) as Listeners[E]
  // }

  public emit<E extends ProviderEventEmitterMethods.Event>(
    event: E,
    data: ProviderEventEmitterMethods.EventParams[E]
  ) {
    this.listeners[event].forEach((listener: ProviderEventListener[E]) => listener(data as any))
  }
}
