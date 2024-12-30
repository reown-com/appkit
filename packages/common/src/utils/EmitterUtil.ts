type EventName = string
type EventCallback<T> = (data?: T) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventData = Record<EventName, any>

export class Emitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static eventListeners = new Map<string, Set<EventCallback<any>>>()

  public on<T extends EventName>(eventName: T, callback: EventCallback<EventData[T]>) {
    if (!Emitter.eventListeners.has(eventName)) {
      Emitter.eventListeners.set(eventName, new Set())
    }
    Emitter.eventListeners.get(eventName)?.add(callback)
  }

  public off<T extends EventName>(eventName: T, callback: EventCallback<EventData[T]>) {
    const listeners = Emitter.eventListeners.get(eventName)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  public emit<T extends EventName>(eventName: T, data?: EventData[T]) {
    const listeners = Emitter.eventListeners.get(eventName)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  public clear(eventName: EventName) {
    Emitter.eventListeners.delete(eventName)
  }

  public clearAll() {
    Emitter.eventListeners.clear()
  }
}
