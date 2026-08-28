import type { Provider, ProviderEventListener } from '@reown/appkit-controllers'

type ProviderEventEmitterMethods = Pick<Provider, 'on' | 'removeListener' | 'emit'>

type Events = keyof ProviderEventListener

type Listener<Event extends Events> = ProviderEventListener[Event]

type Listeners = {
  [Event in Events]: Array<Listener<Event>>
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

  on<Event extends Events>(event: Event, listener: Listener<Event>): void {
    this.listeners[event].push(listener)
  }

  removeListener<T>(event: string, listener: (data: T) => void) {
    if (event in this.listeners) {
      // @ts-expect-error - Bad typed Provider from core package
      this.listeners[event] = this.listeners[event].filter((l: Listener<Events>) => l !== listener)
    }
  }

  public emit(event: string, data?: unknown) {
    if (event in this.listeners) {
      // @ts-expect-error - Bad typed Provider from core package
      this.listeners[event].forEach(listener => listener(data))
    }
  }
}
