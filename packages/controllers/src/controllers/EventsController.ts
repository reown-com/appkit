import { proxy, subscribe as sub } from 'valtio/vanilla'

import { ConstantsUtil, isSafe } from '@reown/appkit-common'

import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type { Event } from '../utils/TypeUtil.js'
import { AccountController } from './AccountController.js'
import { AlertController } from './AlertController.js'
import { ChainController } from './ChainController.js'
import { OptionsController } from './OptionsController.js'

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getAnalyticsUrl()
const api = new FetchUtil({ baseUrl, clientId: null })
const excluded = ['MODAL_CREATED']

// -- Types --------------------------------------------- //
export interface EventsControllerState {
  timestamp: number
  reportedErrors: Record<string, boolean>
  data: Event
}

// -- State --------------------------------------------- //
const state = proxy<EventsControllerState>({
  timestamp: Date.now(),
  reportedErrors: {},
  data: {
    type: 'track',
    event: 'MODAL_CREATED'
  }
})

// -- Controller ---------------------------------------- //
export const EventsController = {
  state,

  subscribe(callback: (newState: EventsControllerState) => void) {
    return sub(state, () => callback(state))
  },

  getSdkProperties() {
    const { projectId, sdkType, sdkVersion } = OptionsController.state

    return {
      projectId,
      st: sdkType,
      sv: sdkVersion || 'html-wagmi-4.2.2'
    }
  },

  async _sendAnalyticsEvent(payload: EventsControllerState) {
    try {
      let address = AccountController.state.address

      if ('address' in payload.data && payload.data.address) {
        address = payload.data.address
      }

      if (excluded.includes(payload.data.event) || typeof window === 'undefined') {
        return
      }

      const caipNetworkId = ChainController.getActiveCaipNetwork()?.caipNetworkId

      await api.post({
        path: '/e',
        params: EventsController.getSdkProperties(),
        body: {
          eventId: CoreHelperUtil.getUUID(),
          url: window.location.href,
          domain: window.location.hostname,
          timestamp: payload.timestamp,
          props: {
            ...payload.data,
            address,
            properties: {
              ...('properties' in payload.data ? payload.data.properties : {}),
              caipNetworkId
            }
          }
        }
      })

      state.reportedErrors['FORBIDDEN'] = false
    } catch (err) {
      const isForbiddenError =
        err instanceof Error &&
        err.cause instanceof Response &&
        err.cause.status === ConstantsUtil.HTTP_STATUS_CODES.FORBIDDEN &&
        !state.reportedErrors['FORBIDDEN']

      if (isForbiddenError) {
        AlertController.open(
          {
            displayMessage: 'Invalid App Configuration',
            debugMessage: `Origin ${
              isSafe() ? window.origin : 'uknown'
            } not found on Allowlist - update configuration on cloud.reown.com`
          },
          'error'
        )

        state.reportedErrors['FORBIDDEN'] = true
      }
    }
  },

  sendEvent(data: EventsControllerState['data']) {
    state.timestamp = Date.now()
    state.data = data
    const MANDATORY_EVENTS: Event['event'][] = [
      'INITIALIZE',
      'CONNECT_SUCCESS',
      'SOCIAL_LOGIN_SUCCESS'
    ]
    if (OptionsController.state.features?.analytics || MANDATORY_EVENTS.includes(data.event)) {
      EventsController._sendAnalyticsEvent(state)
    }
  }
}
