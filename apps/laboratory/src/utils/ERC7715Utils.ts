import type { GrantPermissionsParameters, GrantPermissionsReturnType } from 'viem/experimental'
import { abi as donutContractAbi, address as donutContractAddress } from './DonutContract'
import { encodeAbiParameters, hashMessage, parseEther, type Chain } from 'viem'
import { buildUserOp, sendUserOp, type Call } from './UserOpBuilderServiceUtils'
import { signMessage } from 'viem/accounts'
import { bigIntReplacer } from './CommonUtils'
import { sign as signWithPasskey } from 'webauthn-p256'

export type MultikeySigner = {
  type: 'keys'
  data: {
    ids: string[]
  }
}

export function getPurchaseDonutPermissions(): GrantPermissionsParameters {
  return {
    expiry: Date.now() + 24 * 60 * 60,
    permissions: [
      {
        type: {
          custom: 'donut-purchase'
        },
        data: {
          target: donutContractAddress,
          abi: donutContractAbi,
          valueLimit: parseEther('10').toString(),
          functionName: 'purchase(uint256)'
        },
        policies: []
      }
    ]
  }
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

export async function executeActionsWithPasskeyAndCosignerPermissions(args: {
  actions: Call[]
  passkeyId: string
  chain: Chain
  permissions: GrantPermissionsReturnType
  pci: string
}): Promise<`0x${string}`> {
  const { actions, passkeyId, chain, permissions, pci } = args
  if (!pci) {
    throw new Error('No WC_COSIGNER PCI data available')
  }
  if (!permissions) {
    throw new Error('No permissions available')
  }
  const { signerData, permissionsContext } = permissions

  if (!signerData?.userOpBuilder || !signerData.submitToAddress || !permissionsContext) {
    throw new Error(`Invalid permissions ${JSON.stringify(permissions, bigIntReplacer)}`)
  }
  const accountAddress = signerData.submitToAddress

  const filledUserOp = await buildUserOp({
    account: accountAddress,
    chainId: chain.id,
    calls: actions,
    capabilities: {
      permissions: { context: permissionsContext as `0x${string}` }
    }
  })
  const userOp = filledUserOp.userOp
  const signature = await signUserOperationWithPasskey({
    passkeyId,
    userOpHash: filledUserOp.hash
  })

  userOp.signature = signature
  const sendUserOpResponse = await sendUserOp({
    userOp,
    pci,
    chainId: chain.id,
    permissionsContext: permissionsContext as `0x${string}`
  })

  return sendUserOpResponse.userOpId
}

export async function executeActionsWithECDSAAndCosignerPermissions(args: {
  actions: Call[]
  ecdsaPrivateKey: `0x${string}`
  chain: Chain
  permissions: GrantPermissionsReturnType
  pci: string
}): Promise<`0x${string}`> {
  const { ecdsaPrivateKey, actions, chain, permissions, pci } = args
  if (!pci) {
    throw new Error('No WC_COSIGNER PCI data available')
  }
  if (!permissions) {
    throw new Error('No permissions available')
  }
  const { signerData, permissionsContext } = permissions

  if (!signerData?.submitToAddress || !permissionsContext) {
    throw new Error(`Invalid permissions ${JSON.stringify(permissions, bigIntReplacer)}`)
  }
  const accountAddress = signerData.submitToAddress

  const filledUserOp = await buildUserOp({
    account: accountAddress,
    chainId: chain.id,
    calls: actions,
    capabilities: {
      permissions: { context: permissionsContext as `0x${string}` }
    }
  })

  const userOp = filledUserOp.userOp

  const dappSignature = await signMessage({
    privateKey: ecdsaPrivateKey,
    message: { raw: filledUserOp.hash }
  })
  userOp.signature = dappSignature

  const sendUserOpResponse = await sendUserOp({
    userOp,
    pci,
    chainId: chain.id,
    permissionsContext: permissionsContext as `0x${string}`
  })

  return sendUserOpResponse.userOpId
}
