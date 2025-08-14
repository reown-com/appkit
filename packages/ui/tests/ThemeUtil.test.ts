import { describe, expect, it } from 'vitest'

import type { ThemeVariables } from '@reown/appkit-common'

import { createRootStyles } from '../src/utils/ThemeUtil.js'

describe('ThemeUtil', () => {
  describe('createRootStyles', () => {
    it('should include KHTeka fonts when no custom font family is provided', () => {
      const themeVariables: ThemeVariables = {}
      const styles = createRootStyles(themeVariables)
      expect(styles.core.cssText).toContain("font-family: 'KHTeka'")
      expect(styles.core.cssText).toContain("font-family: 'KHTekaMono'")
    })

    it('should not include Google Fonts import when custom font family is provided', () => {
      const themeVariables: ThemeVariables = {
        '--w3m-font-family': 'Custom Font, sans-serif'
      }
      const styles = createRootStyles(themeVariables)

      expect(styles.core.cssText).not.toContain("font-family: 'KHTeka'")
      expect(styles.core.cssText).not.toContain("font-family: 'KHTekaMono'")
      expect(styles.core.cssText).not.toContain('KHTeka-Medium.woff')
      expect(styles.core.cssText).not.toContain('KHTeka-Light.woff')
      expect(styles.core.cssText).not.toContain('KHTekaMono-Regular.woff')
      expect(styles.core.cssText).not.toContain('KHTeka-Regular.woff')
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
