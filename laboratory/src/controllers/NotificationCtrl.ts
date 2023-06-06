import { proxy } from 'valtio'

// -- initial state ------------------------------------------------ //
interface State {
  open: boolean
  title: string
  body: string
}

const state = proxy<State>({
  open: false,
  title: '',
  body: ''
})

// -- controller --------------------------------------------------- //
export const NotificationCtrl = {
  state,

  open(title: State['title'], body: State['body']) {
    state.open = true
    state.title = title
    state.body = body
  },

  close() {
    state.open = false
  }
}
