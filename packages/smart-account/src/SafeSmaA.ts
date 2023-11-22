import {
  encodeFunctionData,
  hashTypedData,
  toBytes,
  http,
  createPublicClient,
  encodePacked
} from 'viem'
import type { Address, Chain, Transport, Hex } from 'viem'
import { toAccount } from 'viem/accounts'
import { getBytecode } from 'viem/actions'
import { getAccountNonce } from 'permissionless'
import { sepolia } from 'viem/chains'
import type { PrivateKeySafeSmartAccount, CreateSafeSmartAccountArgs } from './SafeSmaATypes.js'
import { createPimlicoBundlerClient } from 'permissionless/clients/pimlico'
import {
  getAccountAddress,
  generateSafeMessageMessage,
  adjustVInSignature,
  SignTransactionNotSupportedBySafeSmartAccount,
  getAccountInitCode
} from './SafeSmaAUtil.js'
import {
  SAFE_ADDRESSES_MAP,
  EIP712_SAFE_OPERATION_TYPE,
  SAFE_VERSION,
  ENTRY_POINT
} from './SafeSmaAConst.js'

// -- Helpers --------------------------------------------------------------------------------------
const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
const pimlicoKey = process.env['NEXT_PUBLIC_PIMLICO_KEY']
const supportedChains = { 11155111: sepolia }

// -- Account --------------------------------------------------------------------------------------
export async function createSafeSmartAccount<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined
>({
  chainId,
  ownerAddress,
  ownerSignMessage,
  ownerSignTypedData
}: CreateSafeSmartAccountArgs): Promise<
  PrivateKeySafeSmartAccount<TTransport, TChain> | undefined
> {
  const chain = supportedChains[chainId]

  if (!chain) {
    return undefined
  }

  const pimlicoBundlerTransport = http(
    `https://api.pimlico.io/v1/${chain.name}/rpc?apikey=${pimlicoKey}`,
    { retryDelay: 1000 }
  )

  const walletConnectTransport = http(
    `https://rpc.walletconnect.com/v1/?chainId=EIP155:${chain.id}&projectId=${projectId}`,
    { retryDelay: 1000 }
  )

  const publicClient = createPublicClient({
    chain,
    transport: walletConnectTransport
  })

  const saltNonce = 0n
  const safeData = SAFE_ADDRESSES_MAP[SAFE_VERSION]
  const addModuleLibAddress = safeData.ADD_MODULES_LIB_ADDRESS
  const safe4337ModuleAddress = safeData.SAFE_4337_MODULE_ADDRESS
  const safeProxyFactoryAddress = safeData.SAFE_PROXY_FACTORY_ADDRESS
  const safeSingletonAddress = safeData.SAFE_SINGLETON_ADDRESS
  const multiSendCallOnlyAddress = safeData.MULTI_SEND_CALL_ONLY_ADDRESS

  const accountAddress = await getAccountAddress<TTransport, TChain>({
    client: publicClient,
    owner: ownerAddress,
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
        await ownerSignMessage({
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
        await ownerSignTypedData({
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
    client: publicClient,
    publicKey: accountAddress,
    entryPoint: ENTRY_POINT,
    source: 'privateKeySafeSmartAccount',
    async getNonce() {
      return getAccountNonce(publicClient, {
        sender: accountAddress,
        entryPoint: ENTRY_POINT
      })
    },
    async signUserOperation(userOperation) {
      const signatures = [
        {
          signer: ownerAddress,
          data: await ownerSignTypedData({
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
              entryPoint: ENTRY_POINT
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
      const contractCode = await getBytecode(publicClient, {
        address: accountAddress
      })

      if ((contractCode?.length ?? 0) > 2) {
        return '0x'
      }

      return getAccountInitCode({
        owner: ownerAddress,
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

    async encodeCallData(args) {
      let to: Address | undefined = undefined
      let value: bigint | undefined = undefined
      let data: Hex | undefined = undefined

      if (Array.isArray(args)) {
        const argsArray = args as {
          to: Address
          value: bigint
          data: Hex
        }[]

        to = multiSendCallOnlyAddress
        value = 0n
        data = encodeFunctionData({
          abi: [
            {
              inputs: [
                {
                  internalType: 'bytes',
                  name: 'transactions',
                  type: 'bytes'
                }
              ],
              name: 'multiSend',
              outputs: [],
              stateMutability: 'payable',
              type: 'function'
            }
          ],
          functionName: 'multiSend',
          args: [
            `0x${argsArray
              .map(argItem => {
                const datBytes = toBytes(argItem.data)

                return encodePacked(
                  ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
                  [0, argItem.to, argItem.value, BigInt(datBytes.length), argItem.data]
                ).slice(2)
              })
              .join('')}`
          ]
        })
      } else {
        const singleTransaction = args as {
          to: Address
          value: bigint
          data: Hex
        }
        to = singleTransaction.to
        data = singleTransaction.data
        value = singleTransaction.value
      }

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
