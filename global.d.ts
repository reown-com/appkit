type ControllerType<T> = {
  state: T
  subscribe: (callback: (newState: T) => void) => () => void
  initialize: () => void
}

declare module '@web3modal/plugin-activity' {
  import { ActivityPlugin } from './packages/core/src/types/ActivityPlugin'

  const plugin: ActivityPlugin
  export default plugin
}
