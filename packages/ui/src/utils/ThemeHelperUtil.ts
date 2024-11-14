const PREFIX_VAR = '--apkt'

export const ThemeHelperUtil = {
  /**
   * Converts a string to kebab case.
   * @param str - The string to convert.
   */
  toKebabCase(str: string) {
    return str
      .replace(/(?<lowerOrDigit>[a-z0-9])(?<upper>[A-Z])/gu, '$<lowerOrDigit>-$<upper>')
      .replace(
        /(?<consecutiveUpper>[A-Z]+)(?<nextUpperWithLower>[A-Z][a-z0-9]+)/gu,
        '$<consecutiveUpper>-$<nextUpperWithLower>'
      )
      .replace(/(?<letters>[a-zA-Z]+)(?<digits>[0-9]+)/gu, '$<letters>-$<digits>')
      .toLowerCase()
  },
  /**
   * Generates a set of rgba colors based on the provided rgb color, name, and params.
   * @param params.rgb - The rgb color
   * @param params.name - The name for the generated rgba colors.
   * @param params.multiplier - A multiplier to adjust the opacity values.
   * @param params.start - The starting index for opacity generation.
   * @param params.end - The ending index for opacity generation.
   */
  generateRgbaColors({
    rgb,
    name,
    multiplier = 1,
    start = 1,
    end = 10
  }: {
    rgb: string
    name: string
    multiplier?: number
    start?: number
    end?: number
  }) {
    const length = end - start + 1
    const opacities = Array.from({ length }, (_, i) => (start + i) * 10)

    return Object.fromEntries(
      opacities.map(value => {
        const multiplied = value * multiplier
        const opacity = multiplied / 100
        const key = `${name}${multiplied.toString().padStart(3, '0')}`

        return [key, `rgba(${rgb}, ${opacity})`]
      })
    )
  },
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
        const variable = currentVar
          ? `${currentVar}-${ThemeHelperUtil.toKebabCase(styleKey)}`
          : ThemeHelperUtil.toKebabCase(styleKey)

        if (styleValue && typeof styleValue === 'object' && Object.keys(styleValue).length) {
          parent[styleKey] = {}
          createVars(
            styleValue as Record<string, unknown>,
            parent[styleKey] as Record<string, unknown>,
            variable
          )
        } else if (typeof styleValue === 'string') {
          parent[styleKey] = `${PREFIX_VAR}--${variable}`
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
        const nextVariable = variable
          ? `${variable}-${ThemeHelperUtil.toKebabCase(varKey)}`
          : ThemeHelperUtil.toKebabCase(varKey)

        const styleValues = _styles[varKey]

        if (varValue && typeof varValue === 'object') {
          assignVars(
            varValue as Record<string, unknown>,
            styleValues as Record<string, unknown>,
            nextVariable
          )
        } else if (typeof styleValues === 'string') {
          assignedCSSVariables[`${PREFIX_VAR}--${nextVariable}`] = styleValues
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
  createRooStyles(variables: Record<string, string>) {
    const styles = Object.entries(variables)
      .map(([key, style]) => `${key}:${style.replace('/[:;{}</>]/g', '')};`)
      .join('')

    return `:root {${styles}}`
  }
}
