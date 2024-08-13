import type { GrantPermissionsParameters } from 'viem/experimental'
import { abi as donutContractAbi, address as donutContractAddress } from './DonutContract'
import { parseEther } from 'viem'

export function getSampleSyncPermissions(
  secp256k1DID: string,
  passkeyDID: string
): GrantPermissionsParameters {
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
          functionName: 'function purchase()'
        },
        policies: []
      }
    ],
    signer: {
      type: 'keys',
      data: {
        ids: [secp256k1DID, passkeyDID]
      }
    }
  }
}

export function getSampleAsyncPermissions(keys: string[]): GrantPermissionsParameters {
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
          functionName: 'function purchase()'
        },
        policies: []
      }
    ],
    signer: {
      type: 'keys',
      data: {
        ids: keys
      }
    }
  }
}
