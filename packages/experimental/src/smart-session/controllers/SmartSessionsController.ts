import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy } from 'valtio/vanilla'
import type { SmartSession } from '../utils/TypeUtils.js'
import {
  AccountController,
  BlockchainApiController,
  ChainController,
  ConnectionController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-core'
import { extractChainAndAddress } from '../helper/index.js'
import { ERROR_MESSAGES } from '../schema/index.js'
import { ConstantsUtil } from '@reown/appkit-common'
import { CosignerService } from '../utils/CosignerService.js'

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

      state.sessions = sessions.pcis.map(session => ({
        ...session,
        expiry: session.expiry * 1000
      }))

      return sessions.pcis
    } catch (e) {
      SnackController.showError('Error fetching smart sessions')

      state.sessions = []

      return []
    }
  },
  async revokeSmartSession(session: SmartSession) {
    try {
      const { activeCaipAddress } = ChainController.state

      // Ensure the namespace is supported and extract address
      const chainAndAddress = extractChainAndAddress(activeCaipAddress)
      if (!activeCaipAddress || !chainAndAddress) {
        throw new Error(ERROR_MESSAGES.INVALID_ADDRESS)
      }
      // Fetch the ConnectionController client
      const connectionControllerClient = ConnectionController._getClient(ConstantsUtil.CHAIN.EVM)

      // Retrieve state values
      const { projectId } = OptionsController.state

      // Instantiate CosignerService and process permissions
      const cosignerService = new CosignerService(projectId)

      RouterController.pushTransactionStack({
        view: 'SmartSessionList',
        goBack: false
      })

      const signature = await connectionControllerClient.revokePermissions({
        pci: session.pci,
        permissions: [...session.permissions.map(p => JSON.parse(JSON.stringify(p)))],
        expiry: Math.floor(session.expiry / 1000),
        address: activeCaipAddress as `0x${string}`
      })

      // Activate the permissions using CosignerService
      await cosignerService.revokePermissions(activeCaipAddress, session.pci, signature)
    } catch (e) {
      SnackController.showError('Error revoking smart session')
    }
  }
}
