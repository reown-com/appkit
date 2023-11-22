import {
  BaseError,
  concatHex,
  encodeFunctionData,
  encodePacked,
  getContractAddress,
  hashMessage,
  hashTypedData,
  hexToBigInt,
  keccak256,
  toBytes,
  zeroAddress
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
import { privateKeyToAccount, toAccount } from 'viem/accounts'
import { getBytecode, getChainId, readContract } from 'viem/actions'
import type { SmartAccount } from 'permissionless/accounts'
import { getAccountNonce } from 'permissionless'

// -- Types ----------------------------------------------------------------------------------------
export type SafeVersion = '1.4.1'

export type PrivateKeySafeSmartAccount<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined
> = SmartAccount<'privateKeySafeSmartAccount', transport, chain>

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

export type SmartAccountEnabledChain = 5 | 11155111

// -- Helpers --------------------------------------------------------------------------------------
export const EIP712_SAFE_OPERATION_TYPE = {
  SafeOp: [
    { type: 'address', name: 'safe' },
    { type: 'bytes', name: 'callData' },
    { type: 'uint256', name: 'nonce' },
    { type: 'uint256', name: 'preVerificationGas' },
    { type: 'uint256', name: 'verificationGasLimit' },
    { type: 'uint256', name: 'callGasLimit' },
    { type: 'uint256', name: 'maxFeePerGas' },
    { type: 'uint256', name: 'maxPriorityFeePerGas' },
    { type: 'address', name: 'entryPoint' }
  ]
}

const SAFE_ADDRESSES_MAP = {
  '1.4.1': {
    11155111: {
      ADD_MODULES_LIB_ADDRESS: '0x191EFDC03615B575922289DC339F4c70aC5C30Af',
      SAFE_4337_MODULE_ADDRESS: '0x39E54Bb2b3Aa444b4B39DEe15De3b7809c36Fc38',
      SAFE_PROXY_FACTORY_ADDRESS: '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67',
      SAFE_SINGLETON_ADDRESS: '0x41675C099F32341bf84BFc5382aF534df5C7461a'
    },
    5: {
      ADD_MODULES_LIB_ADDRESS: '0x191EFDC03615B575922289DC339F4c70aC5C30Af',
      SAFE_4337_MODULE_ADDRESS: '0x39E54Bb2b3Aa444b4B39DEe15De3b7809c36Fc38',
      SAFE_PROXY_FACTORY_ADDRESS: '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67',
      SAFE_SINGLETON_ADDRESS: '0x41675C099F32341bf84BFc5382aF534df5C7461a'
    }
  }
} as const

// -- Utilities ------------------------------------------------------------------------------------
function adjustVInSignature(
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

function generateSafeMessageMessage<
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

function getAccountInitCode({
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

async function getAccountAddress<
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

/**
 * @description Creates an Simple Account from a private key.
 * @returns A Private Key Simple Account.
 */
export async function privateKeyToSafeSmartAccount<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined
>(
  client: Client<TTransport, TChain>,
  {
    privateKey,
    safeVersion,
    entryPoint,
    addModuleLibAddress: _addModuleLibAddress,
    safe4337ModuleAddress: _safe4337ModuleAddress,
    safeProxyFactoryAddress: _safeProxyFactoryAddress,
    safeSingletonAddress: _safeSingletonAddress,
    saltNonce = 0n
  }: {
    privateKey: Hex
    safeVersion: SafeVersion
    entryPoint: Address
    addModuleLibAddress?: Address
    safe4337ModuleAddress?: Address
    safeProxyFactoryAddress?: Address
    safeSingletonAddress?: Address
    saltNonce?: bigint
  }
): Promise<PrivateKeySafeSmartAccount<TTransport, TChain>> {
  const privateKeyAccount = privateKeyToAccount(privateKey)

  const chainId = (await getChainId(client)) as SmartAccountEnabledChain

  const addModuleLibAddress: Address =
    _addModuleLibAddress ?? SAFE_ADDRESSES_MAP[safeVersion][chainId].ADD_MODULES_LIB_ADDRESS
  const safe4337ModuleAddress: Address =
    _safe4337ModuleAddress ?? SAFE_ADDRESSES_MAP[safeVersion][chainId].SAFE_4337_MODULE_ADDRESS
  const safeProxyFactoryAddress: Address =
    _safeProxyFactoryAddress ?? SAFE_ADDRESSES_MAP[safeVersion][chainId].SAFE_PROXY_FACTORY_ADDRESS
  const safeSingletonAddress: Address =
    _safeSingletonAddress ?? SAFE_ADDRESSES_MAP[safeVersion][chainId].SAFE_SINGLETON_ADDRESS

  const accountAddress = await getAccountAddress<TTransport, TChain>({
    client,
    owner: privateKeyAccount.address,
    addModuleLibAddress,
    safe4337ModuleAddress,
    safeProxyFactoryAddress,
    safeSingletonAddress,
    saltNonce
  })

  if (!accountAddress) {
    throw new Error('Account address not found')
  }

  const account = toAccount({
    address: accountAddress,
    async signMessage({ message }) {
      const messageHash = hashTypedData({
        domain: {
          chainId,
          verifyingContract: accountAddress
        },
        types: {
          SafeMessage: [{ name: 'message', type: 'bytes' }]
        },
        primaryType: 'SafeMessage',
        message: {
          message: generateSafeMessageMessage(message)
        }
      })

      return adjustVInSignature(
        'eth_sign',
        await privateKeyAccount.signMessage({
          message: {
            raw: toBytes(messageHash)
          }
        })
      )
    },
    signTransaction(_, __) {
      throw new SignTransactionNotSupportedBySafeSmartAccount()
    },
    async signTypedData(typedData) {
      return adjustVInSignature(
        'eth_signTypedData',
        await privateKeyAccount.signTypedData({
          domain: {
            chainId,
            verifyingContract: accountAddress
          },
          types: {
            SafeMessage: [{ name: 'message', type: 'bytes' }]
          },
          primaryType: 'SafeMessage',
          message: {
            message: generateSafeMessageMessage(typedData)
          }
        })
      )
    }
  })

  return {
    ...account,
    client,
    publicKey: accountAddress,
    entryPoint,
    source: 'privateKeySafeSmartAccount',
    async getNonce() {
      return getAccountNonce(client, {
        sender: accountAddress,
        entryPoint
      })
    },
    async signUserOperation(userOperation) {
      const signatures = [
        {
          signer: privateKeyAccount.address,
          data: await privateKeyAccount.signTypedData({
            domain: {
              chainId,
              verifyingContract: safe4337ModuleAddress
            },
            types: EIP712_SAFE_OPERATION_TYPE,
            primaryType: 'SafeOp',
            message: {
              safe: accountAddress,
              callData: userOperation.callData,
              nonce: userOperation.nonce,
              preVerificationGas: userOperation.preVerificationGas,
              verificationGasLimit: userOperation.verificationGasLimit,
              callGasLimit: userOperation.callGasLimit,
              maxFeePerGas: userOperation.maxFeePerGas,
              maxPriorityFeePerGas: userOperation.maxPriorityFeePerGas,
              entryPoint
            }
          })
        }
      ]

      signatures.sort((left, right) =>
        left.signer.toLowerCase().localeCompare(right.signer.toLowerCase())
      )

      let signatureBytes: Address = '0x'
      for (const sig of signatures) {
        signatureBytes += sig.data.slice(2)
      }

      return signatureBytes
    },
    async getInitCode() {
      const contractCode = await getBytecode(client, {
        address: accountAddress
      })

      if ((contractCode?.length ?? 0) > 2) {
        return '0x'
      }

      return getAccountInitCode({
        owner: privateKeyAccount.address,
        addModuleLibAddress,
        safe4337ModuleAddress,
        safeProxyFactoryAddress,
        safeSingletonAddress,
        saltNonce
      })
    },

    encodeDeployCallData(_) {
      throw new Error("Safe account doesn't support account deployment")
    },

    async encodeCallData({ to, value, data }) {
      return Promise.resolve(
        encodeFunctionData({
          abi: [
            {
              inputs: [
                {
                  internalType: 'address',
                  name: 'to',
                  type: 'address'
                },
                {
                  internalType: 'uint256',
                  name: 'value',
                  type: 'uint256'
                },
                {
                  internalType: 'bytes',
                  name: 'data',
                  type: 'bytes'
                },
                {
                  internalType: 'uint8',
                  name: 'operation',
                  type: 'uint8'
                }
              ],
              name: 'executeUserOp',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function'
            }
          ],
          functionName: 'executeUserOp',
          args: [to, value, data, 0]
        })
      )
    },

    async getDummySignature() {
      return Promise.resolve(
        '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
      )
    }
  }
}
