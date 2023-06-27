import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------------------------------
export interface RouterControllerState {
  view: 'Account' | 'Connect'
  history: RouterControllerState['view'][]
}

// -- Controller ---------------------------------------------------------------
export class RouterController {
  public state = proxy<RouterControllerState>({
    view: 'Connect',
    history: ['Connect']
  })

  public push(view: RouterControllerState['view']) {
    if (view !== this.state.view) {
      this.state.view = view
      this.state.history.push(view)
    }
  }

  public reset(view: RouterControllerState['view']) {
    this.state.view = view
    this.state.history = [view]
  }

  public replace(view: RouterControllerState['view']) {
    if (this.state.history.length > 1 && this.state.history.at(-1) !== view) {
      this.state.view = view
      this.state.history[this.state.history.length - 1] = view
    }
  }

  public goBack() {
    if (this.state.history.length > 1) {
      this.state.history.pop()
      const [last] = this.state.history.slice(-1)
      this.state.view = last
    }
  }
}
