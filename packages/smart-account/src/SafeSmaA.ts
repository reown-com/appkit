import { encodeFunctionData, hashTypedData, toBytes } from 'viem'
import type { Address, Chain, Client, Transport } from 'viem'
import { toAccount } from 'viem/accounts'
import { getBytecode, getChainId } from 'viem/actions'
import { getAccountNonce } from 'permissionless'
import type {
  PrivateKeySafeSmartAccount,
  SmartAccountEnabledChain,
  CreateSafeSmartAccountArgs
} from './SafeSmaATypes.js'
import {
  SAFE_ADDRESSES_MAP,
  getAccountAddress,
  generateSafeMessageMessage,
  adjustVInSignature,
  SignTransactionNotSupportedBySafeSmartAccount,
  EIP712_SAFE_OPERATION_TYPE,
  getAccountInitCode
} from './SafeSmaAUtil.js'

// -- Account --------------------------------------------------------------------------------------
export async function createSafeSmartAccount<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined
>(
  client: Client<TTransport, TChain>,
  {
    ownerAddress,
    ownerSignMessage,
    ownerSignTypedData,
    safeVersion,
    entryPoint,
    addModuleLibAddress: _addModuleLibAddress,
    safe4337ModuleAddress: _safe4337ModuleAddress,
    safeProxyFactoryAddress: _safeProxyFactoryAddress,
    safeSingletonAddress: _safeSingletonAddress,
    saltNonce = 0n
  }: CreateSafeSmartAccountArgs
): Promise<PrivateKeySafeSmartAccount<TTransport, TChain>> {
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
