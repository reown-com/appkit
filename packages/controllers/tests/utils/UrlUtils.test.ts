import { describe, expect, test } from 'vitest'

import { UrlUtils } from '../../src/utils/UrlUtils.js'

describe('UrlUtils', () => {
  describe('parseSchemelessHostPort', () => {
    test('parses host without port', () => {
      expect(UrlUtils.parseSchemelessHostPort('example.com')).toEqual({ host: 'example.com' })
    })

    test('parses host with port', () => {
      expect(UrlUtils.parseSchemelessHostPort('example.com:8080')).toEqual({
        host: 'example.com',
        port: '8080'
      })
    })

    test('ignores path when present', () => {
      expect(UrlUtils.parseSchemelessHostPort('example.com:3000/path/to')).toEqual({
        host: 'example.com',
        port: '3000'
      })
    })

    test('handles empty input and edge cases', () => {
      expect(UrlUtils.parseSchemelessHostPort('')).toEqual({ host: '' })
      expect(UrlUtils.parseSchemelessHostPort(':8080')).toEqual({ host: '', port: '8080' })
    })
  })

  describe('parseOriginRaw and parseUrl', () => {
    test('parseOriginRaw parses scheme, host and optional port', () => {
      expect(UrlUtils.parseOriginRaw('https://example.com')).toEqual({
        scheme: 'https',
        host: 'example.com'
      })
      expect(UrlUtils.parseOriginRaw('https://example.com:8080/path')).toEqual({
        scheme: 'https',
        host: 'example.com',
        port: '8080'
      })
      expect(UrlUtils.parseOriginRaw('invalid-origin')).toBeNull()
    })

    test('parseUrl returns URL for valid input or null for invalid', () => {
      expect(UrlUtils.parseUrl('https://example.com')?.origin).toBe('https://example.com')
      expect(UrlUtils.parseUrl('not a url')).toBeNull()
    })
  })

  describe('pattern matchers', () => {
    test('matchNonWildcardPattern matches explicit scheme+host (ignores path)', () => {
      const currentOrigin = 'https://example.com'
      expect(UrlUtils.matchNonWildcardPattern(currentOrigin, 'https://example.com/path')).toBe(true)
      expect(UrlUtils.matchNonWildcardPattern(currentOrigin, 'http://example.com')).toBe(false)
    })

    test('matchNonWildcardPattern matches schemeless host:port against origin', () => {
      const currentOrigin = 'https://example.com:8080'
      expect(UrlUtils.matchNonWildcardPattern(currentOrigin, 'example.com:8080')).toBe(true)
      expect(UrlUtils.matchNonWildcardPattern(currentOrigin, 'example.com:8443')).toBe(false)
      expect(UrlUtils.matchNonWildcardPattern(currentOrigin, 'example.com')).toBe(true)
    })

    test('matchWildcardPattern respects scheme and port and label counts', () => {
      const current = new URL('https://www.example.com:8443')
      const currentOrigin = 'https://www.example.com:8443'
      expect(
        UrlUtils.matchWildcardPattern(current, currentOrigin, 'https://*.example.com:8443')
      ).toBe(true)
      expect(UrlUtils.matchWildcardPattern(current, currentOrigin, 'http://*.example.com')).toBe(
        false
      )
      expect(UrlUtils.matchWildcardPattern(current, currentOrigin, 'https://*.*.example.com')).toBe(
        false
      )
      expect(UrlUtils.matchWildcardPattern(current, currentOrigin, 'https://*.example.com:*')).toBe(
        true
      )
      expect(
        UrlUtils.matchWildcardPattern(
          new URL('https://example.com'),
          'https://example.com',
          'https://*.example.com'
        )
      ).toBe(false)
    })

    test('matchWildcardPattern treats partial-label wildcards as invalid', () => {
      const current = new URL('https://www-sub.example.com')
      const currentOrigin = 'https://www-sub.example.com'
      expect(
        UrlUtils.matchWildcardPattern(current, currentOrigin, 'https://www-*.example.com')
      ).toBe(false)
    })
  })
})
