import type { CaipNetworkId } from './TypeUtil.js'

export const NetworkUtil = {
  caipNetworkIdToNumber(caipnetworkId?: CaipNetworkId) {
    return caipnetworkId ? caipnetworkId.split(':')[1] : undefined
  }
}
