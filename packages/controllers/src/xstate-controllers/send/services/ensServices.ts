import { fromPromise } from 'xstate'

import { ChainController } from '../../../controllers/ChainController.js'
import { ConnectionController } from '../../../controllers/ConnectionController.js'
import { CoreHelperUtil } from '../../../utils/CoreHelperUtil.js'
import type { ENSResolutionInput, ENSResolutionOutput } from '../types/sendTypes.js'

export const ensResolutionService = fromPromise(
  async ({ input }: { input: ENSResolutionInput }): Promise<ENSResolutionOutput> => {
    const { nameOrAddress, chainNamespace } = input

    if (!nameOrAddress) {
      throw new Error('Name or address is required for ENS resolution')
    }

    const activeChain = chainNamespace || ChainController.state.activeChain

    if (CoreHelperUtil.isAddress(nameOrAddress, activeChain)) {
      return {
        resolvedAddress: nameOrAddress,
        name: undefined,
        avatar: undefined
      }
    }

    try {
      const resolvedAddress = await ConnectionController.getEnsAddress(nameOrAddress)

      if (!resolvedAddress) {
        throw new Error('ENS name could not be resolved')
      }

      let avatar: string | undefined = undefined
      try {
        avatar = (await ConnectionController.getEnsAvatar(nameOrAddress)) as string | undefined
      } catch {
        avatar = undefined
      }

      return {
        resolvedAddress,
        name: nameOrAddress,
        avatar
      }
    } catch (error) {
      if (CoreHelperUtil.isAddress(nameOrAddress, activeChain)) {
        return {
          resolvedAddress: nameOrAddress,
          name: undefined,
          avatar: undefined
        }
      }

      throw new Error(`Invalid address or ENS name: ${nameOrAddress}`)
    }
  }
)
