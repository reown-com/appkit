import { describe, expect, it } from 'vitest'

import type { ThemeVariables } from '@reown/appkit-common'

import { createRootStyles } from '../src/utils/ThemeUtil.js'

describe('ThemeUtil', () => {
  describe('createRootStyles', () => {
    it('should include Google Fonts import when no custom font family is provided', () => {
      const themeVariables: ThemeVariables = {}
      const styles = createRootStyles(themeVariables)
      
      expect(styles.core.cssText).toContain('@import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap\')')
    })

    it('should not include Google Fonts import when custom font family is provided', () => {
      const themeVariables: ThemeVariables = {
        '--w3m-font-family': 'Custom Font, sans-serif'
      }
      const styles = createRootStyles(themeVariables)
      
      expect(styles.core.cssText).not.toContain('@import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap\')')
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
