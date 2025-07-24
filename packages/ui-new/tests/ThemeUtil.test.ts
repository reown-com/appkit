import { describe, expect, it } from 'vitest'

import type { ThemeVariables } from '@reown/appkit-common'

import { createRootStyles } from '../src/utils/ThemeUtil.js'

describe('ThemeUtil', () => {
  describe('createRootStyles', () => {
    it('should include KHTeka font-face declarations when no custom font family is provided', () => {
      const themeVariables: ThemeVariables = {}
      const styles = createRootStyles(themeVariables)

      expect(styles.core.cssText).toContain("font-family: 'KHTeka'")
      expect(styles.core.cssText).toContain("font-family: 'KHTekaMono'")
      expect(styles.core.cssText).toContain('font-weight: 500')
      expect(styles.core.cssText).toContain('font-weight: 300')
      expect(styles.core.cssText).toContain('font-weight: 400')
    })

    it('should include KHTeka font-face declarations when custom font family is undefined', () => {
      const themeVariables: ThemeVariables = {
        '--w3m-font-family': undefined
      }
      const styles = createRootStyles(themeVariables)

      expect(styles.core.cssText).toContain("font-family: 'KHTeka'")
      expect(styles.core.cssText).toContain("font-family: 'KHTekaMono'")
    })

    it('should not include KHTeka font-face declarations when custom font family is provided', () => {
      const themeVariables: ThemeVariables = {
        '--w3m-font-family': 'Custom Font, sans-serif'
      }
      const styles = createRootStyles(themeVariables)

      expect(styles.core.cssText).not.toContain("font-family: 'KHTeka'")
      expect(styles.core.cssText).not.toContain("font-family: 'KHTekaMono'")
    })

    it('should not include KHTeka font-face declarations when custom font family is empty string', () => {
      const themeVariables: ThemeVariables = {
        '--w3m-font-family': ''
      }
      const styles = createRootStyles(themeVariables)

      expect(styles.core.cssText).not.toContain("font-family: 'KHTeka'")
      expect(styles.core.cssText).not.toContain("font-family: 'KHTekaMono'")
    })

    it('should always include keyframe animations regardless of font family setting', () => {
      const withCustomFont: ThemeVariables = { '--w3m-font-family': 'Custom Font' }
      const withoutCustomFont: ThemeVariables = {}

      const stylesWithCustom = createRootStyles(withCustomFont)
      const stylesWithoutCustom = createRootStyles(withoutCustomFont)

      expect(stylesWithCustom.core.cssText).toContain('@keyframes w3m-shake')
      expect(stylesWithoutCustom.core.cssText).toContain('@keyframes w3m-shake')
    })
  })
})
