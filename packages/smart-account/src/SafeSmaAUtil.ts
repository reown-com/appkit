import {
  concatHex,
  encodeFunctionData,
  encodePacked,
  getContractAddress,
  hashMessage,
  hashTypedData,
  hexToBigInt,
  keccak256,
  zeroAddress,
  BaseError
} from 'viem'
import type {
  Address,
  Chain,
  Client,
  Hex,
  SignableMessage,
  Transport,
  TypedData,
  TypedDataDefinition
} from 'viem'
import { readContract } from 'viem/actions'

export class SignTransactionNotSupportedBySafeSmartAccount extends BaseError {
  override name = 'SignTransactionNotSupportedBySafeSmartAccount'
  constructor({ docsPath }: { docsPath?: string } = {}) {
    super(
      [
        'A smart account cannot sign or send transaction, it can only sign message or userOperation.',
        'Please send user operation instead.'
      ].join('\n'),
      {
        docsPath,
        docsSlug: 'account'
      }
    )
  }
}

export function adjustVInSignature(
  signingMethod: 'eth_sign' | 'eth_signTypedData',
  signature: string
): Hex {
  const ETHEREUM_V_VALUES = [0, 1, 27, 28]
  const MIN_VALID_V_VALUE_FOR_SAFE_ECDSA = 27
  let signatureV = parseInt(signature.slice(-2), 16)
  if (!ETHEREUM_V_VALUES.includes(signatureV)) {
    throw new Error('Invalid signature')
  }
  if (signingMethod === 'eth_sign') {
    if (signatureV < MIN_VALID_V_VALUE_FOR_SAFE_ECDSA) {
      signatureV += MIN_VALID_V_VALUE_FOR_SAFE_ECDSA
    }
    signatureV += 4
  }
  if (signingMethod === 'eth_signTypedData') {
    if (signatureV < MIN_VALID_V_VALUE_FOR_SAFE_ECDSA) {
      signatureV += MIN_VALID_V_VALUE_FOR_SAFE_ECDSA
    }
  }

  return (signature.slice(0, -2) + signatureV.toString(16)) as Hex
}

export function generateSafeMessageMessage<
  const TTypedData extends TypedData | Record<string, unknown>,
  TPrimaryType extends string = string
>(message: SignableMessage | TypedDataDefinition<TTypedData, TPrimaryType>): Hex {
  const signableMessage = message as SignableMessage

  if (typeof signableMessage === 'string' || signableMessage.raw) {
    return hashMessage(signableMessage)
  }

  return hashTypedData(message as TypedDataDefinition<TTypedData, TPrimaryType>)
}

function getInitializerCode({
  owner,
  addModuleLibAddress,
  safe4337ModuleAddress
}: {
  owner: Address
  addModuleLibAddress: Address
  safe4337ModuleAddress: Address
}) {
  return encodeFunctionData({
    abi: [
      {
        inputs: [
          {
            internalType: 'address[]',
            name: '_owners',
            type: 'address[]'
          },
          {
            internalType: 'uint256',
            name: '_threshold',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address'
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes'
          },
          {
            internalType: 'address',
            name: 'fallbackHandler',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'paymentToken',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'payment',
            type: 'uint256'
          },
          {
            internalType: 'address payable',
            name: 'paymentReceiver',
            type: 'address'
          }
        ],
        name: 'setup',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ],
    functionName: 'setup',
    args: [
      [owner],
      1n,
      addModuleLibAddress,
      encodeFunctionData({
        abi: [
          {
            inputs: [
              {
                internalType: 'address[]',
                name: 'modules',
                type: 'address[]'
              }
            ],
            name: 'enableModules',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function'
          }
        ],
        functionName: 'enableModules',
        args: [[safe4337ModuleAddress]]
      }),
      safe4337ModuleAddress,
      zeroAddress,
      0n,
      zeroAddress
    ]
  })
}

export function getAccountInitCode({
  owner,
  addModuleLibAddress,
  safe4337ModuleAddress,
  safeProxyFactoryAddress,
  safeSingletonAddress,
  saltNonce = 0n
}: {
  owner: Address
  addModuleLibAddress: Address
  safe4337ModuleAddress: Address
  safeProxyFactoryAddress: Address
  safeSingletonAddress: Address
  saltNonce?: bigint
}): Hex {
  if (!owner) {
    throw new Error('Owner account not found')
  }

  const initializer = getInitializerCode({
    owner,
    addModuleLibAddress,
    safe4337ModuleAddress
  })

  const initCodeCallData = encodeFunctionData({
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: '_singleton',
            type: 'address'
          },
          {
            internalType: 'bytes',
            name: 'initializer',
            type: 'bytes'
          },
          {
            internalType: 'uint256',
            name: 'saltNonce',
            type: 'uint256'
          }
        ],
        name: 'createProxyWithNonce',
        outputs: [
          {
            internalType: 'contract SafeProxy',
            name: 'proxy',
            type: 'address'
          }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ],
    functionName: 'createProxyWithNonce',
    args: [safeSingletonAddress, initializer, saltNonce]
  })

  return concatHex([safeProxyFactoryAddress, initCodeCallData])
}

export async function getAccountAddress<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined
>({
  client,
  owner,
  addModuleLibAddress,
  safe4337ModuleAddress,
  safeProxyFactoryAddress,
  safeSingletonAddress,
  saltNonce = 0n
}: {
  client: Client<TTransport, TChain>
  owner: Address
  addModuleLibAddress: Address
  safe4337ModuleAddress: Address
  safeProxyFactoryAddress: Address
  safeSingletonAddress: Address
  saltNonce?: bigint
}): Promise<Address> {
  const proxyCreationCode = await readContract(client, {
    abi: [
      {
        inputs: [],
        name: 'proxyCreationCode',
        outputs: [
          {
            internalType: 'bytes',
            name: '',
            type: 'bytes'
          }
        ],
        stateMutability: 'pure',
        type: 'function'
      }
    ],
    address: safeProxyFactoryAddress,
    functionName: 'proxyCreationCode'
  })

  const deploymentCode = encodePacked(
    ['bytes', 'uint256'],
    [proxyCreationCode, hexToBigInt(safeSingletonAddress)]
  )

  const initializer = getInitializerCode({
    owner,
    addModuleLibAddress,
    safe4337ModuleAddress
  })

  const salt = keccak256(
    encodePacked(
      ['bytes32', 'uint256'],
      [keccak256(encodePacked(['bytes'], [initializer])), saltNonce]
    )
  )

  return getContractAddress({
    from: safeProxyFactoryAddress,
    salt,
    bytecode: deploymentCode,
    opcode: 'CREATE2'
  })
}
