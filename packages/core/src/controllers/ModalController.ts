import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------------------------------
export interface ModalControllerState {
  open: boolean
}

// -- Controller ---------------------------------------------------------------
export class ModalController {
  public state = proxy<ModalControllerState>({
    open: false
  })

  public open() {
    this.state.open = true
  }

  public close() {
    this.state.open = false
  }
}
