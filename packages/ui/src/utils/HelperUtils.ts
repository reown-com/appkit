import type { SpacingType } from './TypesUtil'

export function getSpacingStyles(spacing: SpacingType | SpacingType[], index: number) {
  if (Array.isArray(spacing)) {
    return spacing[index] ? `var(--wui-spacing-${spacing[index]})` : undefined
  } else if (typeof spacing === 'string') {
    return `var(--wui-spacing-${spacing})`
  }

  return undefined
}

export function removeUrlPrefix(url: string) {
  const prefixes = ['https://', 'http://', 'www.']
  let modifiedUrl = url

  prefixes.forEach(prefix => {
    if (modifiedUrl.startsWith(prefix)) {
      modifiedUrl = modifiedUrl.slice(prefix.length)
    }
  })

  return modifiedUrl
}
