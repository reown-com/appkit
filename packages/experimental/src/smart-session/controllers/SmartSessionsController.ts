import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy } from 'valtio/vanilla'
import {
  AccountController,
  BlockchainApiController,
  ChainController,
  ConnectionController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-core'
import { ERROR_MESSAGES } from '../schema/index.js'
import { ConstantsUtil } from '@reown/appkit-common'
import { CosignerService } from '../utils/CosignerService.js'

import { ProviderUtil } from '@reown/appkit/store'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type {
  SmartSession,
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse
} from '../utils/TypeUtils.js'
import {
  assertWalletGrantPermissionsResponse,
  extractChainAndAddress,
  updateRequestSigner,
  validateRequest
} from '../helper/index.js'
import type { PermissionsCapability, WalletCapabilities } from '../utils/ERC5792Types.js'
import { ERC7715_METHOD } from '../utils/ConstantUtils.js'

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
      const caipAddress = AccountController.state.caipAddress
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
    const connectionControllerClient = ConnectionController._getClient(
      CommonConstantsUtil.CHAIN.EVM
    )

    //Check for connected wallet supports permissions capabilities
    const walletCapabilities = (await connectionControllerClient.getCapabilities(
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
      view: 'SmartSessionCreated',
      goBack: false
    })

    const rawResponse = await connectionControllerClient.grantPermissions([request])

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
    const provider = ProviderUtil.getProvider(CommonConstantsUtil.CHAIN.EVM)
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
      const connectionControllerClient = ConnectionController._getClient(ConstantsUtil.CHAIN.EVM)

      // Retrieve state values
      const { projectId } = OptionsController.state

      // Instantiate CosignerService and process permissions
      const cosignerService = new CosignerService(projectId)

      RouterController.pushTransactionStack({
        view: 'SmartSessionList',
        goBack: false
      })

      const signature = await connectionControllerClient.revokePermissions({
        pci: session.pci,
        permissions: [...session.permissions.map(p => JSON.parse(JSON.stringify(p)))],
        expiry: Math.floor(session.expiry / 1000),
        address: activeCaipAddress as `0x${string}`
      })

      // Activate the permissions using CosignerService
      await cosignerService.revokePermissions(activeCaipAddress, session.pci, signature)
      state.sessions = state.sessions.filter(s => s.pci !== session.pci)
    } catch (e) {
      SnackController.showError('Error revoking smart session')
    }
  }
}
