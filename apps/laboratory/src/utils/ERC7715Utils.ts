import type { GrantPermissionsReturnType } from 'viem/experimental'
import { abi as donutContractAbi, address as donutContractAddress } from './DonutContract'
import { encodeAbiParameters, hashMessage, toFunctionSelector, type Chain } from 'viem'
import { WalletConnectCosigner } from './WalletConnectCosignerUtils'
import { buildUserOp, type Call, type FillUserOpResponse } from './UserOpBuilderServiceUtils'
import { signMessage } from 'viem/accounts'
import { bigIntReplacer } from './CommonUtils'
import { sign as signWithPasskey } from 'webauthn-p256'
import type { SmartSessionGrantPermissionsRequest } from '@reown/appkit-experimental-smart-session'

export type MultikeySigner = {
  type: 'keys'
  data: {
    ids: string[]
  }
}

export function getPurchaseDonutPermissions(): Omit<
  SmartSessionGrantPermissionsRequest,
  'signer' | 'chainId' | 'address' | 'expiry'
> {
  return {
    permissions: [
      {
        type: 'contract-call',
        data: {
          address: donutContractAddress,
          abi: donutContractAbi,
          functionSelector: toFunctionSelector('purchase(uint256)')
        }
      }
    ],
    policies: []
  }
}

async function prepareUserOperationWithPermissions(args: {
  actions: Call[]
  chain: Chain
  permissions: GrantPermissionsReturnType
}): Promise<FillUserOpResponse> {
  const { actions, chain, permissions } = args
  if (!permissions) {
    throw new Error('No permissions available')
  }
  const { signerData, permissionsContext } = permissions

  if (!signerData?.userOpBuilder || !signerData.submitToAddress || !permissionsContext) {
    throw new Error(`Invalid permissions ${JSON.stringify(permissions, bigIntReplacer)}`)
  }

  const filledUserOp = await buildUserOp({
    account: signerData.submitToAddress,
    chainId: chain.id,
    calls: actions,
    capabilities: {
      permissions: { context: permissionsContext as `0x${string}` }
    }
  })

  return filledUserOp
}

async function signUserOperationWithPasskey(args: {
  passkeyId: string
  userOpHash: `0x${string}`
}): Promise<`0x${string}`> {
  const { userOpHash, passkeyId } = args

  const ethMessageUserOpHash = hashMessage({ raw: userOpHash })
  const usersPasskeySignature = await signWithPasskey({
    credentialId: passkeyId,
    hash: ethMessageUserOpHash
  })

  const authenticatorData = usersPasskeySignature.webauthn.authenticatorData
  const clientDataJSON = usersPasskeySignature.webauthn.clientDataJSON
  const responseTypeLocation = usersPasskeySignature.webauthn.typeIndex
  // Const userVerificationRequired = usersPasskeySignature.webauthn.userVerificationRequired
  const r = usersPasskeySignature.signature.r
  const s = usersPasskeySignature.signature.s

  const passkeySignature = encodeAbiParameters(
    [
      { type: 'bytes' },
      { type: 'string' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'bool' }
    ],
    [authenticatorData, clientDataJSON, responseTypeLocation, r, s, false]
  )

  return passkeySignature
}

async function signUserOperationWithECDSAKey(args: {
  ecdsaPrivateKey: `0x${string}`
  userOpHash: `0x${string}`
}): Promise<`0x${string}`> {
  const { ecdsaPrivateKey, userOpHash } = args

  const dappSignatureOnUserOp = await signMessage({
    privateKey: ecdsaPrivateKey,
    message: { raw: userOpHash }
  })

  return dappSignatureOnUserOp
}

export async function executeActionsWithPasskeyAndCosignerPermissions(args: {
  actions: Call[]
  passkeyId: string
  chain: Chain
  permissions: GrantPermissionsReturnType
  pci: string
}): Promise<`0x${string}`> {
  const { actions, passkeyId, chain, permissions, pci } = args
  const accountAddress = permissions?.signerData?.submitToAddress
  if (!accountAddress) {
    throw new Error(`Unable to get account details from granted permission`)
  }

  if (!pci) {
    throw new Error('No WC_COSIGNER PCI data available')
  }
  const caip10Address = `eip155:${chain?.id}:${accountAddress}`
  const filledUserOp = await prepareUserOperationWithPermissions({
    actions,
    chain,
    permissions
  })
  const userOp = filledUserOp.userOp
  const signature = await signUserOperationWithPasskey({
    passkeyId,
    userOpHash: filledUserOp.hash
  })

  userOp.signature = signature

  const walletConnectCosigner = new WalletConnectCosigner()
  const cosignResponse = await walletConnectCosigner.coSignUserOperation(caip10Address, {
    pci,
    userOp: {
      ...userOp,
      callData: userOp.callData,
      callGasLimit: BigInt(userOp.callGasLimit),
      nonce: BigInt(userOp.nonce),
      preVerificationGas: BigInt(userOp.preVerificationGas),
      verificationGasLimit: BigInt(userOp.verificationGasLimit),
      sender: userOp.sender,
      signature: userOp.signature,
      maxFeePerGas: BigInt(userOp.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(userOp.maxPriorityFeePerGas)
    }
  })

  return cosignResponse.receipt as `0x${string}`
}

export async function executeActionsWithECDSAAndCosignerPermissions(args: {
  actions: Call[]
  ecdsaPrivateKey: `0x${string}`
  chain: Chain
  permissions: GrantPermissionsReturnType
  pci: string
}): Promise<`0x${string}`> {
  const { ecdsaPrivateKey, actions, chain, permissions, pci } = args
  const accountAddress = permissions?.signerData?.submitToAddress
  if (!accountAddress) {
    throw new Error(`Unable to get account details from granted permission`)
  }

  if (!pci) {
    throw new Error('No WC_COSIGNER PCI data available')
  }
  const caip10Address = `eip155:${chain?.id}:${accountAddress}`
  const filledUserOp = await prepareUserOperationWithPermissions({
    actions,
    chain,
    permissions
  })
  const userOp = filledUserOp.userOp

  const dappSignature = await signUserOperationWithECDSAKey({
    ecdsaPrivateKey,
    userOpHash: filledUserOp.hash
  })

  userOp.signature = dappSignature
  const walletConnectCosigner = new WalletConnectCosigner()
  const cosignResponse = await walletConnectCosigner.coSignUserOperation(caip10Address, {
    pci,
    userOp: {
      ...userOp,
      callData: userOp.callData,
      callGasLimit: BigInt(userOp.callGasLimit),
      nonce: BigInt(userOp.nonce),
      preVerificationGas: BigInt(userOp.preVerificationGas),
      verificationGasLimit: BigInt(userOp.verificationGasLimit),
      sender: userOp.sender,
      signature: userOp.signature,
      maxFeePerGas: BigInt(userOp.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(userOp.maxPriorityFeePerGas)
    }
  })

  return cosignResponse.receipt as `0x${string}`
}
