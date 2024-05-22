type ControllerType<T> = {
  state: T
  subscribe: (callback: (newState: T) => void) => () => void
  initialize: () => void
}
