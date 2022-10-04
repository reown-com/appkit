import type {
  EnsCtrlFetchEnsAddressArgs,
  EnsCtrlFetchEnsAvatarArgs,
  EnsCtrlFetchEnsNameArgs,
  EnsCtrlFetchEnsResolverArgs
} from '../../../types/statelessCtrlTypes'
import { ClientCtrl } from '../statefull/ClientCtrl'

export const EnsCtrl = {
  async fetchEnsAddress(args: EnsCtrlFetchEnsAddressArgs) {
    const data = await ClientCtrl.ethereum().fetchEnsAddress(args)

    return data
  },

  async fetchEnsAvatar(args: EnsCtrlFetchEnsAvatarArgs) {
    const data = await ClientCtrl.ethereum().fetchEnsAvatar(args)

    return data
  },

  async fetchEnsName(args: EnsCtrlFetchEnsNameArgs) {
    const data = await ClientCtrl.ethereum().fetchEnsName(args)

    return data
  },

  async fetchEnsResolver(args: EnsCtrlFetchEnsResolverArgs) {
    const data = await ClientCtrl.ethereum().fetchEnsResolver(args)

    return data
  }
}
