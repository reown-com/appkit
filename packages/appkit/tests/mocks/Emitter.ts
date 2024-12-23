type EventName = string
type EventCallback<T> = (data?: T) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventData = Record<EventName, any>

export class MockEmitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static eventListeners = new Map<string, Set<EventCallback<any>>>()

  public on<T extends EventName>(eventName: T, callback: EventCallback<EventData[T]>) {
    if (!MockEmitter.eventListeners.has(eventName)) {
      MockEmitter.eventListeners.set(eventName, new Set())
    }
    MockEmitter.eventListeners.get(eventName)?.add(callback)
  }

  public off<T extends EventName>(eventName: T, callback: EventCallback<EventData[T]>) {
    const listeners = MockEmitter.eventListeners.get(eventName)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  public emit<T extends EventName>(eventName: T, data?: EventData[T]) {
    const listeners = MockEmitter.eventListeners.get(eventName)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  public clear(eventName: EventName) {
    MockEmitter.eventListeners.delete(eventName)
  }

  public clearAll() {
    MockEmitter.eventListeners.clear()
  }
}
