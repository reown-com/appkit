import type { ThemeType } from '@reown/appkit-common'
import { styles as allStyles, tokens } from './ThemeConstantsUtil.js'
import { css as litCSS, type CSSResultGroup, unsafeCSS } from 'lit'

const PREFIX_VAR = '--apkt'

export const ThemeHelperUtil = {
  /**
   * Recursively transforms a nested styles object into a new object with CSS variable strings.
   * @param styles - The original styles object to transform.
   */
  createCSSVariables<styles extends Record<string, unknown>>(styles: styles) {
    const cssVariables = {} as styles
    const cssVariablesVarPrefix = {} as styles

    function createVars(
      _styles: Record<string, unknown>,
      parent: Record<string, unknown>,
      currentVar = ''
    ) {
      for (const [styleKey, styleValue] of Object.entries(_styles)) {
        const variable = currentVar ? `${currentVar}-${styleKey}` : styleKey

        if (styleValue && typeof styleValue === 'object' && Object.keys(styleValue).length) {
          parent[styleKey] = {}
          createVars(
            styleValue as Record<string, unknown>,
            parent[styleKey] as Record<string, unknown>,
            variable
          )
        } else if (typeof styleValue === 'string') {
          parent[styleKey] = `${PREFIX_VAR}-${variable}`
        }
      }
    }

    function addVarsPrefix(_styles: Record<string, unknown>, parent: Record<string, unknown>) {
      for (const [key, value] of Object.entries(_styles)) {
        if (value && typeof value === 'object') {
          parent[key] = {}
          addVarsPrefix(value as Record<string, unknown>, parent[key] as Record<string, unknown>)
        } else if (typeof value === 'string') {
          parent[key] = `var(${value})`
        }
      }
    }

    createVars(styles, cssVariables)
    addVarsPrefix(cssVariables, cssVariablesVarPrefix)

    return { cssVariables, cssVariablesVarPrefix }
  },
  /**
   * Assigns CSS variables to the values in a styles object.
   * @param vars - The variables object to transform.
   * @param styles - The mapping of style keys to CSS variable names.
   */
  assignCSSVariables<vars extends Record<string, unknown>, styles extends Record<string, unknown>>(
    vars: vars,
    styles: styles
  ): Record<string, string> {
    const assignedCSSVariables: Record<string, string> = {}

    function assignVars(
      _vars: Record<string, unknown>,
      _styles: Record<string, unknown>,
      variable?: string
    ) {
      for (const [varKey, varValue] of Object.entries(_vars)) {
        const nextVariable = variable ? `${variable}-${varKey}` : varKey

        const styleValues = _styles[varKey]

        if (varValue && typeof varValue === 'object') {
          assignVars(
            varValue as Record<string, unknown>,
            styleValues as Record<string, unknown>,
            nextVariable
          )
        } else if (typeof styleValues === 'string') {
          assignedCSSVariables[`${PREFIX_VAR}-${nextVariable}`] = styleValues
        }
      }
    }

    assignVars(vars, styles)

    return assignedCSSVariables
  },
  /**
   * Creates a string of CSS variables for the root element.
   * @param variables - The CSS variables object.
   */
  createRootStyles(theme: ThemeType) {
    const styles = {
      ...allStyles,
      tokens: { ...allStyles.tokens, theme: theme === 'light' ? tokens.light : tokens.dark }
    }

    const { cssVariables } = ThemeHelperUtil.createCSSVariables(styles)

    const assignedCSSVariables = ThemeHelperUtil.assignCSSVariables(cssVariables, styles)

    const rootStyles = Object.entries(assignedCSSVariables)
      .map(([key, style]) => `${key}:${style.replace('/[:;{}</>]/g', '')};`)
      .join('')

    return `:root {${rootStyles}}`
  }
}

// Creates all CSS variables with var() strings
const { cssVariablesVarPrefix: vars } = ThemeHelperUtil.createCSSVariables(allStyles)

/**
 * Utility to define Lit CSS styles with variables.
 * @param  strings - Template literal strings used to define the CSS.
 * @param values - Functions that return CSS variables from design system.
 */
function css(
  strings: TemplateStringsArray,
  ...values: ((_vars: typeof vars) => CSSResultGroup | number | string)[]
) {
  return litCSS(
    strings,
    ...values.map(value =>
      typeof value === 'function' ? unsafeCSS(value(vars)) : unsafeCSS(value)
    )
  )
}

export { css, vars }
