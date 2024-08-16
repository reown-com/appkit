import { describe, expect, it } from 'vitest'
import { withSolanaNamespace } from '../src/utils/withSolanaNamespace.js'

describe('withSolanaNamespace util', () => {
  it('should return undefined if chainId is undefined', () => {
    expect(withSolanaNamespace()).toBeUndefined()
  })

  it('should return solana:chainId if chainId is a string', () => {
    expect(withSolanaNamespace('chainId')).toBe('solana:chainId')
  })
})
