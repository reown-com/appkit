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

const SLIP44_MSB = 0x80000000

function convertEVMChainIdToCoinType(chainId: number): number {
  if (chainId >= SLIP44_MSB) {
    throw new Error('Invalid chainId')
  }

  return (SLIP44_MSB | chainId) >>> 0
}

// -- Types --------------------------------------------- //
type Suggestion = {
  name: string
  registered: boolean
}

export interface EnsControllerState {
  suggestions: Suggestion[]
  error: string
  loading: boolean
}

type StateKey = keyof EnsControllerState

// -- State --------------------------------------------- //
const state = proxy<EnsControllerState>({
  suggestions: [],
  error: '',
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
      const errorMessage = error?.reasons?.[0]?.description || 'Error resolving ENS name'
      state.error = errorMessage

      return null
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
          name: suggestion.name.replace('.wc.ink', '')
        })) || []
      state.error = ''
      state.loading = false

      return state.suggestions
    } catch (e) {
      state.loading = false
      const error = e as BlockchainApiEnsError
      const errorMessage = error?.reasons?.[0]?.description || 'Error resolving suggestions'
      state.error = errorMessage

      return []
    }
  },

  async getNamesForAddress(address: string) {
    try {
      const network = NetworkController.state.caipNetwork
      if (!network) {
        state.error = 'No network selected'

        return []
      }
      const coinType = convertEVMChainIdToCoinType(
        NetworkUtil.caipNetworkIdToNumber(network.id) as number
      )

      const response = await BlockchainApiController.reverseLookupEnsName({ address })

      // For now we filter this way until BlockchainApi has fixed the /coinType endpoint
      const names = response.filter(name => name.addresses[coinType]?.address === address)

      return names
    } catch (e) {
      const error = e as BlockchainApiEnsError
      const errorMessage = error?.reasons?.[0]?.description || 'Error resolving address to ENS name'
      state.error = errorMessage

      return []
    }
  },

  async registerName(name: string) {
    const network = NetworkController.state.caipNetwork
    if (!network) {
      state.error = 'No network selected'

      return
    }
    try {
      const address = AccountController.state.address
      const emailConnector = ConnectorController.getEmailConnector()
      if (!address || !emailConnector) {
        throw new Error('Address or email connector not found')
      }
      const message = JSON.stringify({
        name: `${name}.wc.ink`,
        attributes: {},
        timestamp: Math.floor(Date.now() / 1000)
      })
      state.loading = true

      RouterController.pushTransactionStack({
        view: 'Account',
        goBack: false,
        onSuccess() {
          state.loading = false
        }
      })

      const signature = await ConnectionController.signMessage(message)

      await BlockchainApiController.registerEnsName({
        // TOD0: Add coin type calculation when ready on BE.
        coin_type: convertEVMChainIdToCoinType(
          NetworkUtil.caipNetworkIdToNumber(network.id) as number
        ),
        address: address as `0x${string}`,
        signature,
        message
      })

      AccountController.setProfileName(`${name}.wc.ink`)
      state.loading = false
    } catch (e) {
      state.loading = false
      const error = e as BlockchainApiEnsError
      const errorMessage = error?.reasons?.[0]?.description || 'Error registering ENS name'
      state.error = errorMessage
    }
  }
}
