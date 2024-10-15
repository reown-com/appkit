import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy } from 'valtio/vanilla'
import type { SmartSession } from '../utils/TypeUtils.js'
import { AccountController, BlockchainApiController, SnackController } from '@reown/appkit-core'

// -- Types --------------------------------------------- //
export type SmartSessionsControllerState = {
  sessions: SmartSession[]
}

type StateKey = keyof SmartSessionsControllerState

// -- State --------------------------------------------- //
const state = proxy<SmartSessionsControllerState>({
  sessions: []
})

// -- Controller ---------------------------------------- //
export const SmartSessionsController = {
  state,
  subscribeKey<K extends StateKey>(
    key: K,
    callback: (value: SmartSessionsControllerState[K]) => void
  ) {
    return subKey(state, key, callback)
  },
  async getSmartSessions() {
    try {
      const caipAddress = AccountController.state.caipAddress
      if (!caipAddress) {
        return []
      }

      const sessions = (await BlockchainApiController.getSmartSessions(caipAddress)) as {
        pcis: SmartSession[]
      }
      state.sessions = sessions.pcis

      return sessions.pcis
    } catch (e) {
      SnackController.showError('Error fetching smart sessions')

      const MOCK_SESSIONS: SmartSession[] = [
        {
          project: {
            id: '0x123',
            name: 'Uniswap',
            url: 'https://app.uniswap.org',
            iconUrl:
              'https://app.uniswap.org/static/media/uniswap-wallet-icon.12b3568891522db07d59.png'
          },
          pci: '0x123',
          expiry: Date.now() + 10_000,
          permissions: [],
          policies: [],
          createdAt: Date.now() - 10_000,
          context: '0x123'
        },
        {
          project: {
            id: '0x123',
            name: 'Uniswap',
            url: 'https://app.uniswap.org',
            iconUrl:
              'https://app.uniswap.org/static/media/uniswap-wallet-icon.12b3568891522db07d59.png'
          },
          pci: '0x123',
          expiry: Date.now() - 5000,
          permissions: [],
          policies: [],
          createdAt: Date.now() - 15_000,
          context: '0x123'
        },
        {
          project: {
            id: '0x123',
            name: 'Uniswap',
            url: 'https://app.uniswap.org',
            iconUrl:
              'https://app.uniswap.org/static/media/uniswap-wallet-icon.12b3568891522db07d59.png'
          },
          pci: '0x123',
          expiry: Date.now() + 10_000,
          permissions: [],
          policies: [],
          createdAt: Date.now() - 10_000,
          context: '0x123',
          revokedAt: Date.now()
        }
      ]

      state.sessions = MOCK_SESSIONS

      return MOCK_SESSIONS
    }
  }
}
