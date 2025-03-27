import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { EnsUtil } from '../utils/EnsUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type { BlockchainApiEnsError } from '../utils/TypeUtil.js'
import { withErrorBoundary } from '../utils/withErrorBoundary.js'
import { AccountController } from './AccountController.js'
import { BlockchainApiController } from './BlockchainApiController.js'
import { ChainController } from './ChainController.js'
import { ConnectionController } from './ConnectionController.js'
import { ConnectorController } from './ConnectorController.js'
import { RouterController } from './RouterController.js'
import { TelemetryErrorCategory } from './TelemetryController.js'

// -- Types --------------------------------------------- //
type Suggestion = {
  name: string
  registered: boolean
}

export type ReownName = `${string}.reown.id` | `${string}.wcn.id`

export interface EnsControllerState {
  suggestions: Suggestion[]
  loading: boolean
}

type StateKey = keyof EnsControllerState

// -- State --------------------------------------------- //
const state = proxy<EnsControllerState>({
  suggestions: [],
  loading: false
})

// -- Controller ---------------------------------------- //
const controller = {
  state,

  subscribe(callback: (newState: EnsControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: EnsControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  async resolveName(name: string) {
    try {
      return await BlockchainApiController.lookupEnsName(name)
    } catch (e) {
      const error = e as BlockchainApiEnsError
      throw new Error(error?.reasons?.[0]?.description || 'Error resolving name')
    }
  },

  async isNameRegistered(name: string) {
    try {
      await BlockchainApiController.lookupEnsName(name)

      return true
    } catch {
      return false
    }
  },

  async getSuggestions(value: string) {
    try {
      state.loading = true
      state.suggestions = []
      const response = await BlockchainApiController.getEnsNameSuggestions(value)
      state.suggestions =
        response.suggestions.map(suggestion => ({
          ...suggestion,
          name: suggestion.name
        })) || []

      return state.suggestions
    } catch (e) {
      const errorMessage = this.parseEnsApiError(e, 'Error fetching name suggestions')
      throw new Error(errorMessage)
    } finally {
      state.loading = false
    }
  },

  async getNamesForAddress(address: string) {
    try {
      const network = ChainController.state.activeCaipNetwork
      if (!network) {
        return []
      }
      const cachedEns = StorageUtil.getEnsFromCacheForAddress(address)
      if (cachedEns) {
        return cachedEns
      }

      const response = await BlockchainApiController.reverseLookupEnsName({ address })

      StorageUtil.updateEnsCache({
        address,
        ens: response,
        timestamp: Date.now()
      })

      return response
    } catch (e) {
      const errorMessage = this.parseEnsApiError(e, 'Error fetching names for address')
      throw new Error(errorMessage)
    }
  },

  async registerName(name: ReownName) {
    const network = ChainController.state.activeCaipNetwork
    if (!network) {
      throw new Error('Network not found')
    }

    const address = AccountController.state.address
    const emailConnector = ConnectorController.getAuthConnector()
    if (!address || !emailConnector) {
      throw new Error('Address or auth connector not found')
    }

    state.loading = true

    try {
      const message = JSON.stringify({
        name,
        attributes: {},
        // Unix timestamp
        timestamp: Math.floor(Date.now() / 1000)
      })

      RouterController.pushTransactionStack({
        view: 'RegisterAccountNameSuccess',
        goBack: false,
        replace: true,
        onCancel() {
          state.loading = false
        }
      })

      const signature = await ConnectionController.signMessage(message)
      const networkId = network.id

      if (!networkId) {
        throw new Error('Network not found')
      }

      const coinType = EnsUtil.convertEVMChainIdToCoinType(Number(networkId))
      await BlockchainApiController.registerEnsName({
        coinType,
        address: address as `0x${string}`,
        signature: signature as `0x${string}`,
        message
      })

      AccountController.setProfileName(name, network.chainNamespace)
      RouterController.replace('RegisterAccountNameSuccess')
    } catch (e) {
      const errorMessage = this.parseEnsApiError(e, `Error registering name ${name}`)
      RouterController.replace('RegisterAccountName')
      throw new Error(errorMessage)
    } finally {
      state.loading = false
    }
  },
  validateName(name: string) {
    return /^[a-zA-Z0-9-]{4,}$/u.test(name)
  },
  parseEnsApiError(error: unknown, defaultError: string) {
    const ensError = error as BlockchainApiEnsError

    return ensError?.reasons?.[0]?.description || defaultError
  }
}

// Export the controller wrapped with our error boundary
export const EnsController = withErrorBoundary(
  controller,
  TelemetryErrorCategory.INTERNAL_SDK_ERROR
)
