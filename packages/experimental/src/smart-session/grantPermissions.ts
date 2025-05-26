import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'
import { ProviderUtil } from '@reown/appkit-utils'

import {
  assertWalletGrantPermissionsResponse,
  extractChainAndAddress,
  updateRequestSigner,
  validateRequest
} from './helper/index.js'
import { ERROR_MESSAGES } from './schema/index.js'
import { ERC7715_METHOD } from './utils/ConstantUtils.js'
import { CosignerService } from './utils/CosignerService.js'
import type { PermissionsCapability, WalletCapabilities } from './utils/ERC5792Types.js'
import type {
  SmartSessionGrantPermissionsRequest,
  SmartSessionGrantPermissionsResponse
} from './utils/TypeUtils.js'

/**
 * 1. Validate the request using the SmartSessionGrantPermissionsRequestSchema
 * 2. check connected wallet supports `wallet_grantPermissions` method
 * 3. check connected wallet supports permissions capabilities
 *  3.1. if supported then validate request against the supported permissions capabilities of the connected wallet
 *    3.2. if validation fails throw error
 * 4. Add permission using CosignerService
 * 5. Update request signer with the cosigner key
 * 6. Call `wallet_grantPermissions` method
 * 7. Validate and type guard the response
 * 8. Activate the permissions using CosignerService
 * 9. Return the permissions granted and the context
 * @param request SmartSessionGrantPermissionsRequest
 * @returns SmartSessionGrantPermissionsResponse
 *
 */
export async function grantPermissions(
  request: SmartSessionGrantPermissionsRequest
): Promise<SmartSessionGrantPermissionsResponse> {
  validateRequest(request)

  const isSupported = isSmartSessionSupported()
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
    validateRequestForSupportedPermissionsCapability(request, permissionsCapabilities)
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

  const rawResponse = await connectionControllerClient?.grantPermissions([request])

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
}

export function validateRequestForSupportedPermissionsCapability(
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
      throw new Error(`Permission type ${permission.type} is not supported by the connected wallet`)
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
}

export function isSmartSessionSupported(): boolean {
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
}
