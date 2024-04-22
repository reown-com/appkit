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

const WC_NAME_SUFFIX = '.wc.ink'

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
          name: suggestion.name.replace(WC_NAME_SUFFIX, '')
        })) || []
      state.loading = false

      return state.suggestions
    } catch (e) {
      state.loading = false
      const errorMessage = this.parseEnsApiError(e, 'Error fetching name suggestions')
      throw new Error(errorMessage)
    }
  },

  async getNamesForAddress(address: string) {
    try {
      const network = NetworkController.state.caipNetwork
      if (!network) {
        return []
      }
      const coinType = EnsUtil.convertEVMChainIdToCoinType(
        NetworkUtil.caipNetworkIdToNumber(network.id)!
      )

      const response = await BlockchainApiController.reverseLookupEnsName({ address })

      // For now we filter this way until BlockchainApi has fixed the /coinType endpoint
      const names = response.filter(name => name.addresses[coinType]?.address === address)

      return names
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
    const emailConnector = ConnectorController.getEmailConnector()
    if (!address || !emailConnector) {
      throw new Error('Address or email connector not found')
    }
    state.loading = true
    const message = JSON.stringify({
      name: `${name}.wc.ink`,
      attributes: {},
      timestamp: Math.floor(Date.now() / 1000)
    })

    try {
      RouterController.pushTransactionStack({
        view: 'Account',
        goBack: false,
        onSuccess() {
          state.loading = false
        },
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
        // TOD0: Add coin type calculation when ready on BE.
        coinType,
        address: address as `0x${string}`,
        signature,
        message
      })

      AccountController.setProfileName(`${name}.wc.ink`)
      state.loading = false
    } catch (e) {
      state.loading = false
      const errorMessage = this.parseEnsApiError(e, `Error registering name ${name}`)
      throw new Error(errorMessage)
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
