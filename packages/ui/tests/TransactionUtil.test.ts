import { describe, expect, it } from 'vitest'

import type { Transaction } from '@reown/appkit-common'

import { TransactionUtil } from '../src/utils/TransactionUtil.js'

// Mocks for TransactionTransfer and Transaction
const nftTransfer = {
  nft_info: {
    name: 'Cool NFT',
    content: { preview: { url: 'nft-url' } },
    flags: { is_spam: false }
  },
  direction: 'in' as const,
  quantity: { numeric: '1' }
}

const fungibleTransfer = {
  fungible_info: {
    symbol: 'TOK',
    icon: { url: 'token-url' }
  },
  direction: 'in' as const,
  quantity: { numeric: '123.4567' }
}

const secondFungibleTransfer = {
  fungible_info: {
    symbol: 'TOK2',
    icon: { url: 'token2-url' }
  },
  direction: 'in' as const,
  quantity: { numeric: '10' }
}

describe('TransactionUtil.getTransactionImages', () => {
  it('returns NFT image for NFT transfer', () => {
    const images = TransactionUtil.getTransactionImages([nftTransfer])
    expect(images[0]?.type).toBe('NFT')
    expect(images[0]?.url).toBe('nft-url')
  })

  it('returns fungible image for fungible transfer', () => {
    const images = TransactionUtil.getTransactionImages([fungibleTransfer])
    expect(images[0]?.type).toBe('FUNGIBLE')
    expect(images[0]?.url).toBe('token-url')
  })

  it('returns images in reverse order for two non-NFT transfers', () => {
    const images = TransactionUtil.getTransactionImages([fungibleTransfer, secondFungibleTransfer])
    expect(images[0]?.url).toBe('token2-url')
    expect(images[1]?.url).toBe('token-url')
  })

  it('returns all images for multiple transfers', () => {
    const images = TransactionUtil.getTransactionImages([nftTransfer, fungibleTransfer])
    expect(images.length).toBe(2)
  })
})

describe('TransactionUtil.getTransactionDescriptions', () => {
  const baseTx = {
    id: 'tx1',
    metadata: { operationType: 'receive', status: 'success' },
    transfers: [fungibleTransfer]
  } as unknown as Transaction

  it('returns description with + prefix for plusTypes', () => {
    const desc = TransactionUtil.getTransactionDescriptions(baseTx)
    expect(desc[0]?.startsWith('+')).toBe(true)
    expect(desc[0]).toContain('123.457 TOK')
  })

  it('returns description with - prefix for minusTypes', () => {
    const tx = { ...baseTx, metadata: { operationType: 'withdraw' } } as unknown as Transaction
    const desc = TransactionUtil.getTransactionDescriptions(tx)
    expect(desc[0]?.startsWith('-')).toBe(true)
  })

  it('returns NFT name for NFT transfer', () => {
    const tx = {
      ...baseTx,
      transfers: [nftTransfer],
      metadata: { operationType: 'receive' }
    } as unknown as Transaction
    const desc = TransactionUtil.getTransactionDescriptions(tx)
    expect(desc[0]).toContain('Cool NFT')
  })

  it('returns reversed descriptions for multiple transfers', () => {
    const tx = {
      ...baseTx,
      transfers: [fungibleTransfer, secondFungibleTransfer],
      metadata: { operationType: 'receive' }
    } as unknown as Transaction
    const desc = TransactionUtil.getTransactionDescriptions(tx)
    expect(desc.length).toBe(2)
    expect(desc[0]).toContain('10.000 TOK2')
    expect(desc[1]).toContain('123.457 TOK')
  })

  it('returns status if no transfers and not send/receive', () => {
    const tx = {
      metadata: { operationType: 'burn', status: 'failed' },
      transfers: []
    } as unknown as Transaction
    const desc = TransactionUtil.getTransactionDescriptions(tx)
    expect(desc[0]).toBe('failed')
  })

  it('returns return status for send/receive with no transfers', () => {
    const tx = {
      metadata: {
        operationType: 'send',
        sentFrom: '0x1234567890abcdef',
        sentTo: '0xfedcba0987654321',
        status: 'success'
      },
      transfers: []
    } as unknown as Transaction
    const desc = TransactionUtil.getTransactionDescriptions(tx)
    expect(desc[0]).toBe('success')
  })
})

describe('TransactionUtil.mergeTransfers', () => {
  const createToken1Transfer = (quantity = '100') => ({
    fungible_info: {
      name: 'Token1',
      symbol: 'TOK1',
      icon: { url: 'token1-url' }
    },
    direction: 'in' as const,
    quantity: { numeric: quantity }
  })

  const createToken2Transfer = (quantity = '200') => ({
    fungible_info: {
      name: 'Token2',
      symbol: 'TOK2',
      icon: { url: 'token2-url' }
    },
    direction: 'in' as const,
    quantity: { numeric: quantity }
  })

  it('returns empty array for empty input', () => {
    const result = TransactionUtil.mergeTransfers([])
    expect(result).toEqual([])
  })

  it('returns single transfer unchanged', () => {
    const token1Transfer = createToken1Transfer()
    const result = TransactionUtil.mergeTransfers([token1Transfer])
    expect(result).toEqual([token1Transfer])
  })

  it('returns multiple transfers with different names unchanged', () => {
    const token1Transfer = createToken1Transfer()
    const token2Transfer = createToken2Transfer()
    const result = TransactionUtil.mergeTransfers([token1Transfer, token2Transfer])
    expect(result).toEqual([token1Transfer, token2Transfer])
  })

  it('merges transfers with same token name', () => {
    const token1Transfer = createToken1Transfer('100')
    const token1Transfer2 = createToken1Transfer('50')
    const result = TransactionUtil.mergeTransfers([token1Transfer, token1Transfer2])
    expect(result.length).toBe(1)
    expect(result[0]?.fungible_info?.name).toBe('Token1')
    expect(result[0]?.quantity.numeric).toBe('150')
  })

  it('merges multiple transfers with mixed same and different names', () => {
    const token1Transfer = createToken1Transfer('100')
    const token2Transfer = createToken2Transfer('200')
    const token1Transfer2 = createToken1Transfer('50')
    const result = TransactionUtil.mergeTransfers([token1Transfer, token2Transfer, token1Transfer2])
    expect(result.length).toBe(2)

    // Find the merged Token1 transfer
    const token1Merged = result.find(t => t?.fungible_info?.name === 'Token1')
    expect(token1Merged?.quantity.numeric).toBe('150') // '100' + '50'

    // Token2 should remain unchanged
    const token2Result = result.find(t => t?.fungible_info?.name === 'Token2')
    expect(token2Result?.quantity.numeric).toBe('200')
  })

  it('handles transfers with undefined fungible_info gracefully', () => {
    const token1Transfer = createToken1Transfer()
    const transferWithoutFungible = {
      direction: 'in' as const,
      quantity: { numeric: '100' }
    } as any

    const result = TransactionUtil.mergeTransfers([token1Transfer, transferWithoutFungible])
    expect(result.length).toBe(2)
    expect(result).toContain(token1Transfer)
    expect(result).toContain(transferWithoutFungible)
  })
})
