import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

// -- Types --------------------------------------------- //
type TriggerRect = {
  width: number
  height: number
  top: number
  left: number
}

export interface TooltipControllerState {
  message: string
  triggerRect: TriggerRect
  open: boolean
  variant: 'shade' | 'fill'
}

type StateKey = keyof TooltipControllerState

// -- State --------------------------------------------- //
const state = proxy<TooltipControllerState>({
  message: '',
  open: false,
  triggerRect: {
    width: 0,
    height: 0,
    top: 0,
    left: 0
  },
  variant: 'shade'
})

// -- Controller ---------------------------------------- //
export const TooltipController = {
  state,

  subscribe(callback: (newState: TooltipControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: TooltipControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  showTooltip({
    message,
    triggerRect,
    variant
  }: {
    message: string
    triggerRect: TriggerRect
    variant: 'shade' | 'fill'
  }) {
    state.open = true
    state.message = message
    state.triggerRect = triggerRect
    state.variant = variant
  },

  hide() {
    state.open = false
    state.message = ''
    state.triggerRect = {
      width: 0,
      height: 0,
      top: 0,
      left: 0
    }
  }
}
