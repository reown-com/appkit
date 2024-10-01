import { abi as donutContractAbi, address as donutContractAddress } from './DonutContract'
import { encodeAbiParameters, hashMessage, toHex, type Chain } from 'viem'
import { prepareCalls, sendPreparedCalls, type Call } from './UserOpBuilderServiceUtils'
import { signMessage } from 'viem/accounts'
import { sign as signWithPasskey } from 'webauthn-p256'
import type { SmartSessionGrantPermissionsRequest } from '@reown/appkit-experimental/smart-session'

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
          functions: [
            {
              functionName: 'purchase'
            }
          ]
        }
      }
    ],
    policies: []
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

export async function executeActionsWithPasskey(args: {
  actions: Call[]
  passkeyId: string
  chain: Chain
  accountAddress: `0x${string}`
  permissionsContext: string
}): Promise<string[]> {
  const { actions, passkeyId, chain, accountAddress, permissionsContext } = args

  if (!permissionsContext) {
    throw new Error('No permissions available')
  }
  if (!accountAddress) {
    throw new Error('No account Address available')
  }

  const prepareCallsResponse = await prepareCalls({
    from: accountAddress,
    chainId: toHex(chain.id),
    calls: actions.map(call => ({
      to: call.to,
      data: call.data,
      value: toHex(call.value)
    })),
    capabilities: {
      permissions: { context: permissionsContext }
    }
  })
  if (prepareCallsResponse.length !== 1 && prepareCallsResponse[0]) {
    throw new Error('Invalid response type')
  }
  const response = prepareCallsResponse[0]
  if (!response || response.preparedCalls.type !== 'user-operation-v07') {
    throw new Error('Invalid response type')
  }
  const signatureRequest = response.signatureRequest
  const dappSignature = await signUserOperationWithPasskey({
    passkeyId,
    userOpHash: signatureRequest.hash
  })

  const sendUserOpResponse = await sendPreparedCalls({
    context: response.context,
    preparedCalls: response.preparedCalls,
    signature: dappSignature
  })

  return sendUserOpResponse
}

export async function executeActionsWithECDSAKey(args: {
  actions: Call[]
  ecdsaPrivateKey: `0x${string}`
  chain: Chain
  accountAddress: `0x${string}`
  permissionsContext: string
}): Promise<string[]> {
  const { ecdsaPrivateKey, actions, chain, accountAddress, permissionsContext } = args
  if (!permissionsContext) {
    throw new Error('No permissions available')
  }
  if (!accountAddress) {
    throw new Error('No account Address available')
  }

  const prepareCallsResponse = await prepareCalls({
    from: accountAddress,
    chainId: toHex(chain.id),
    calls: actions.map(call => ({
      to: call.to,
      data: call.data,
      value: toHex(call.value)
    })),
    capabilities: {
      permissions: { context: permissionsContext }
    }
  })
  if (prepareCallsResponse.length !== 1 && prepareCallsResponse[0]) {
    throw new Error('Invalid response type')
  }
  const response = prepareCallsResponse[0]
  if (!response || response.preparedCalls.type !== 'user-operation-v07') {
    throw new Error('Invalid response type')
  }
  const signatureRequest = response.signatureRequest
  const dappSignature = await signMessage({
    privateKey: ecdsaPrivateKey,
    message: { raw: signatureRequest.hash }
  })

  const sendUserOpResponse = await sendPreparedCalls({
    context: response.context,
    preparedCalls: response.preparedCalls,
    signature: dappSignature
  })

  return sendUserOpResponse
}
