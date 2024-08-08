import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { BlockchainApiController } from './BlockchainApiController.js'
import type { BlockchainApiEnsError } from '../utils/TypeUtil.js'
import { AccountController } from './AccountController.js'
import { ConnectorController } from './ConnectorController.js'
import { RouterController } from './RouterController.js'
import { ConnectionController } from './ConnectionController.js'
import { NetworkController } from './NetworkController.js'
import { NetworkUtil } from '@web3modal/common'
import { EnsUtil } from '../utils/EnsUtil.js'
import { ConstantsUtil } from '@web3modal/common'

// -- Types --------------------------------------------- //
type Suggestion = {
  name: string
  registered: boolean
}

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
export const EnsController = {
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

  async getSuggestions(name: string) {
    try {
      state.loading = true
      state.suggestions = []
      const response = await BlockchainApiController.getEnsNameSuggestions(name)
      state.suggestions =
        response.suggestions.map(suggestion => ({
          ...suggestion,
          name: suggestion.name.replace(ConstantsUtil.WC_NAME_SUFFIX, '')
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
      const network = NetworkController.state.caipNetwork
      if (!network) {
        return []
      }

      const response = await BlockchainApiController.reverseLookupEnsName({ address })

      return response
    } catch (e) {
      const errorMessage = this.parseEnsApiError(e, 'Error fetching names for address')
      throw new Error(errorMessage)
    }
  },

  async registerName(name: string) {
    const network = NetworkController.state.caipNetwork
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
        name: `${name}${ConstantsUtil.WC_NAME_SUFFIX}`,
        attributes: {},
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
      const networkId = NetworkUtil.caipNetworkIdToNumber(network.id)

      if (!networkId) {
        throw new Error('Network not found')
      }

      const coinType = EnsUtil.convertEVMChainIdToCoinType(networkId)
      await BlockchainApiController.registerEnsName({
        coinType,
        address: address as `0x${string}`,
        signature,
        message
      })

      AccountController.setProfileName(`${name}${ConstantsUtil.WC_NAME_SUFFIX}`)
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
