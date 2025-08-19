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

    // If it's already a valid address, return as-is
    if (CoreHelperUtil.isAddress(nameOrAddress, activeChain)) {
      return {
        resolvedAddress: nameOrAddress,
        name: undefined,
        avatar: undefined
      }
    }

    try {
      // Try to resolve ENS name
      const resolvedAddress = await ConnectionController.getEnsAddress(nameOrAddress)

      if (!resolvedAddress) {
        throw new Error('ENS name could not be resolved')
      }

      // Try to get avatar (this might fail, that's ok)
      let avatar: string | undefined = undefined
      try {
        avatar = (await ConnectionController.getEnsAvatar(nameOrAddress)) as string | undefined
      } catch {
        // Avatar fetch failed, continue without it
        avatar = undefined
      }

      return {
        resolvedAddress,
        name: nameOrAddress,
        avatar
      }
    } catch (error) {
      // If ENS resolution fails, check if the input might still be a valid address
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
