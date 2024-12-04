import { proxy } from 'valtio/vanilla'

// -- Types --------------------------------------------- //
export interface PageControllerState {
  page: Page | null
}

type Page = 'ethereum' | 'solana'

// -- State --------------------------------------------- //
const state = proxy<PageControllerState>({
  page: null
})

// -- Controller ---------------------------------------- //
export const PageController = {
  state,

  setPage(page: Page) {
    state.page = page
  }
}
