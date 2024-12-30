import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SmartSessionsController } from '../../src/smart-session/controllers/SmartSessionsController.js'
import type { CreateSubscriptionRequest } from '../../src/smart-session/utils/TypeUtils.js'

describe('createSubscription', () => {
  beforeEach(() => {
    vi.spyOn(SmartSessionsController, 'grantPermissions').mockResolvedValue({
      permissions: [],
      context: '',
      expiry: 0,
      address: '0x0',
      chainId: '0x0'
    })
  })

  it('should create a subscription with native asset', async () => {
    const request: CreateSubscriptionRequest = {
      interval: '1d',
      amount: '0x01',
      asset: 'native',
      chainId: '0x1',
      expiry: 1234567890,
      signerPublicKey: '0x0'
    }

    await SmartSessionsController.createSubscription(request)
    expect(SmartSessionsController.grantPermissions).toHaveBeenCalledWith({
      chainId: request.chainId,
      expiry: request.expiry,
      signer: {
        type: 'keys',
        data: {
          keys: [
            {
              type: 'secp256k1',
              publicKey: request.signerPublicKey
            }
          ]
        }
      },
      permissions: [
        {
          type: 'native-token-recurring-allowance',
          data: {
            allowance: request.amount,
            start: expect.any(Number),
            period: expect.any(Number)
          }
        }
      ],
      policies: []
    })
  })

  it('should throw an error for invalid asset', async () => {
    const request: CreateSubscriptionRequest = {
      interval: '1d',
      amount: '0x01',
      //@ts-expect-error
      asset: 'randomAsset',
      chainId: '0x1',
      expiry: 1234567890,
      signerPublicKey: '0x0'
    }

    await expect(SmartSessionsController.createSubscription(request)).rejects.toThrow(
      'Invalid asset'
    )
  })
})
