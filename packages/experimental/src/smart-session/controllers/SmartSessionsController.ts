import { proxy } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { ConstantsUtil as CommonConstantsUtil, type Hex } from '@reown/appkit-common'
import {
  BlockchainApiController,
  ChainController,
  ConnectionController,
  OptionsController,
  ProviderController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'

import {
  assertWalletGrantPermissionsResponse,
  extractChainAndAddress,
  getIntervalInSeconds,
  updateRequestSigner,
  validateRequest
} from '../helper/index.js'
import { ERROR_MESSAGES } from '../schema/index.js'
import { ERC7715_METHOD } from '../utils/ConstantUtils.js'
import { CosignerService } from '../utils/CosignerService.js'
import type { PermissionsCapability, WalletCapabilities } from '../utils/ERC5792Types.js'
import type {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  Permission,
  SmartSession,
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse
} from '../utils/TypeUtils.js'

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
      const caipAddress = ChainController.getActiveCaipAddress()
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
  async grantPermissions(
    request: SmartSessionGrantPermissionsRequest
  ): Promise<SmartSessionGrantPermissionsResponse> {
    validateRequest(request)

    const isSupported = this.isSmartSessionSupported()
    if (!isSupported) {
      throw new Error('Wallet does not support `wallet_grantPermissions` method')
    }

    const { activeCaipAddress } = ChainController.state

    // Ensure the namespace is supported and extract address
    const chainAndAddress = extractChainAndAddress(activeCaipAddress)
    if (!activeCaipAddress || !chainAndAddress) {
      throw new Error(ERROR_MESSAGES.INVALID_ADDRESS)
    }
    // Fetch the ConnectionController client
    const connectionControllerClient = ConnectionController._getClient()

    //Check for connected wallet supports permissions capabilities
    const walletCapabilities = (await connectionControllerClient?.getCapabilities(
      chainAndAddress.address
    )) as WalletCapabilities

    const hexChainId: `0x${string}` = `0x${parseInt(chainAndAddress.chain, 10).toString(16)}`
    const permissionsCapabilities = walletCapabilities?.[hexChainId]?.permissions

    if (permissionsCapabilities) {
      this.validateRequestForSupportedPermissionsCapability(request, permissionsCapabilities)
    }

    // Retrieve state values
    const { projectId } = OptionsController.state

    // Instantiate CosignerService and process permissions
    const cosignerService = new CosignerService(projectId)
    const addPermissionResponse = await cosignerService.addPermission(activeCaipAddress, request)
    // Update request signer with the cosigner key
    updateRequestSigner(request, addPermissionResponse.key)

    RouterController.pushTransactionStack({
      onSuccess() {
        RouterController.replace('SmartSessionCreated')
      }
    })

    const versionedRequest = { ...request, version: 2 }
    const rawResponse = await connectionControllerClient?.grantPermissions([versionedRequest])

    // Validate and type guard the response
    const response = assertWalletGrantPermissionsResponse(rawResponse)

    // Activate the permissions using CosignerService
    await cosignerService.activatePermissions(activeCaipAddress, {
      pci: addPermissionResponse.pci,
      ...response
    })

    // Return the permissions granted and the context
    return {
      permissions: response.permissions,
      context: addPermissionResponse.pci,
      expiry: response.expiry,
      address: response.address || chainAndAddress.address,
      chainId: response.chainId
    }
  },

  validateRequestForSupportedPermissionsCapability(
    request: SmartSessionGrantPermissionsRequest,
    capabilities: PermissionsCapability
  ) {
    if (!capabilities.supported) {
      throw new Error('Wallet does not support permissions capabilities')
    }

    const supportedPermissions = capabilities.permissionTypes
    const supportedSigners = capabilities.signerTypes
    const supportedPolicies = capabilities.policyTypes

    request.permissions.forEach(permission => {
      if (!supportedPermissions.includes(permission.type)) {
        throw new Error(
          `Permission type ${permission.type} is not supported by the connected wallet`
        )
      }
    })

    if (!supportedSigners.includes(request.signer.type)) {
      throw new Error(`Signer type ${request.signer.type} is not supported by the connected wallet`)
    }

    request.policies.forEach(policy => {
      if (!supportedPolicies.includes(policy.type)) {
        throw new Error(`Policy type ${policy.type} is not supported by the connected wallet`)
      }
    })
  },

  isSmartSessionSupported(): boolean {
    const provider = ProviderController.getProvider(CommonConstantsUtil.CHAIN.EVM)

    if (!provider) {
      return false
    }

    // If it's not a WalletConnect provider, assume smart session is supported
    if (!provider.isWalletConnect) {
      return true
    }

    // Check if the ERC7715 method is supported in the WalletConnect session
    const evmNamespace = provider.session?.namespaces?.[CommonConstantsUtil.CHAIN.EVM]
    const supportedMethods = evmNamespace?.methods || []

    return supportedMethods.includes(ERC7715_METHOD)
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
      const connectionControllerClient = ConnectionController._getClient()

      // Retrieve state values
      const { projectId } = OptionsController.state

      // Instantiate CosignerService and process permissions
      const cosignerService = new CosignerService(projectId)

      RouterController.pushTransactionStack({
        onSuccess() {
          RouterController.replace('SmartSessionList')
        }
      })

      const signature = await connectionControllerClient?.revokePermissions({
        pci: session.pci,
        permissions: [...session.permissions.map(p => JSON.parse(JSON.stringify(p)))],
        expiry: Math.floor(session.expiry / 1000),
        address: activeCaipAddress
      })

      // Activate the permissions using CosignerService
      await cosignerService.revokePermissions(activeCaipAddress, session.pci, signature as Hex)
      state.sessions = state.sessions.filter(s => s.pci !== session.pci)
    } catch (e) {
      SnackController.showError('Error revoking smart session')
    }
  },
  async createSubscription(
    request: CreateSubscriptionRequest
  ): Promise<CreateSubscriptionResponse> {
    let permissions: Permission[] = []

    const interval = getIntervalInSeconds(request.interval)
    const start = Date.now()
    switch (request.asset) {
      case 'native':
        permissions = [
          {
            type: 'native-token-recurring-allowance',
            data: {
              allowance: request.amount,
              start,
              period: interval
            }
          }
        ]
        break
      default:
        throw new Error('Invalid asset')
    }

    return await this.grantPermissions({
      chainId: request.chainId,
      expiry: request.expiry,
      signer: {
        type: 'keys',
        data: {
          keys: [
            {
              type: 'secp256k1',
              publicKey: request.signerPublicKey
            }
          ]
        }
      },
      permissions,
      policies: []
    })
  }
}
