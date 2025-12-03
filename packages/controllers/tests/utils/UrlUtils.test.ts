import { describe, expect, test } from 'vitest'

import {
  matchNonWildcardPattern,
  matchWildcardPattern,
  parseOriginRaw,
  parseSchemelessHostPort,
  parseUrl
} from '../../src/utils/UrlUtils.js'

describe('UrlUtils', () => {
  describe('parseSchemelessHostPort', () => {
    test('parses host without port', () => {
      expect(parseSchemelessHostPort('example.com')).toEqual({ host: 'example.com' })
    })

    test('parses host with port', () => {
      expect(parseSchemelessHostPort('example.com:8080')).toEqual({
        host: 'example.com',
        port: '8080'
      })
    })

    test('ignores path when present', () => {
      expect(parseSchemelessHostPort('example.com:3000/path/to')).toEqual({
        host: 'example.com',
        port: '3000'
      })
    })

    test('handles empty input and edge cases', () => {
      expect(parseSchemelessHostPort('')).toEqual({ host: '' })
      expect(parseSchemelessHostPort(':8080')).toEqual({ host: '', port: '8080' })
    })
  })

  describe('parseOriginRaw and parseUrl', () => {
    test('parseOriginRaw parses scheme, host and optional port', () => {
      expect(parseOriginRaw('https://example.com')).toEqual({
        scheme: 'https',
        host: 'example.com'
      })
      expect(parseOriginRaw('https://example.com:8080/path')).toEqual({
        scheme: 'https',
        host: 'example.com',
        port: '8080'
      })
      expect(parseOriginRaw('invalid-origin')).toBeNull()
    })

    test('parseUrl returns URL for valid input or null for invalid', () => {
      expect(parseUrl('https://example.com')?.origin).toBe('https://example.com')
      expect(parseUrl('not a url')).toBeNull()
    })
  })

  describe('pattern matchers', () => {
    test('matchNonWildcardPattern matches explicit scheme+host (ignores path)', () => {
      const currentOrigin = 'https://example.com'
      expect(matchNonWildcardPattern(currentOrigin, 'https://example.com/path')).toBe(true)
      expect(matchNonWildcardPattern(currentOrigin, 'http://example.com')).toBe(false)
    })

    test('matchNonWildcardPattern matches schemeless host:port against origin', () => {
      const currentOrigin = 'https://example.com:8080'
      expect(matchNonWildcardPattern(currentOrigin, 'example.com:8080')).toBe(true)
      expect(matchNonWildcardPattern(currentOrigin, 'example.com:8443')).toBe(false)
      expect(matchNonWildcardPattern(currentOrigin, 'example.com')).toBe(true)
    })

    test('matchWildcardPattern respects scheme and port and label counts', () => {
      const current = new URL('https://www.example.com:8443')
      const currentOrigin = 'https://www.example.com:8443'
      expect(matchWildcardPattern(current, currentOrigin, 'https://*.example.com:8443')).toBe(true)
      expect(matchWildcardPattern(current, currentOrigin, 'http://*.example.com')).toBe(false)
      expect(matchWildcardPattern(current, currentOrigin, 'https://*.*.example.com')).toBe(false)
      expect(matchWildcardPattern(current, currentOrigin, 'https://*.example.com:*')).toBe(true)
      expect(
        matchWildcardPattern(
          new URL('https://example.com'),
          'https://example.com',
          'https://*.example.com'
        )
      ).toBe(false)
    })

    test('matchWildcardPattern treats partial-label wildcards as invalid', () => {
      const current = new URL('https://www-sub.example.com')
      const currentOrigin = 'https://www-sub.example.com'
      expect(matchWildcardPattern(current, currentOrigin, 'https://www-*.example.com')).toBe(false)
    })
  })
})
