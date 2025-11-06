/**
 * Parses a string as a URL.
 * @param value - The string to parse.
 * @returns The parsed URL object or null if invalid.
 */
export function parseUrl(value: string): URL | null {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

/**
 * Parses a schemeless host:port pattern from a string.
 * @param pattern - The input pattern string.
 * @returns An object containing the host and optional port.
 */
export function parseSchemelessHostPort(pattern: string): { host: string; port?: string } {
  const parts = pattern.split('/')
  const withoutPath = parts.length > 0 && parts[0] !== undefined ? parts[0] : ''
  const lastColon = withoutPath.lastIndexOf(':')
  if (lastColon === -1) {
    return { host: withoutPath }
  }

  return {
    host: withoutPath.slice(0, lastColon),
    port: withoutPath.slice(lastColon + 1)
  }
}

/**
 * Parses an origin string into its scheme, host, and optional port.
 * @param origin - The origin string to parse.
 * @returns An object with scheme, host, and optional port, or null if invalid.
 */
export function parseOriginRaw(
  origin: string
): { scheme: string; host: string; port?: string } | null {
  const schemeIdx = origin.indexOf('://')
  if (schemeIdx === -1) {
    return null
  }
  const scheme = origin.slice(0, schemeIdx)
  const start = schemeIdx + 3
  let end = origin.indexOf('/', start)
  if (end === -1) {
    end = origin.length
  }
  const hostPort = origin.slice(start, end)
  const lastColon = hostPort.lastIndexOf(':')
  if (lastColon === -1) {
    return { scheme, host: hostPort }
  }

  return { scheme, host: hostPort.slice(0, lastColon), port: hostPort.slice(lastColon + 1) }
}

/**
 * Checks if the current origin matches a non-wildcard pattern.
 * @param currentOrigin - The current origin as a string.
 * @param pattern - The pattern string to match.
 * @returns True if the pattern matches, otherwise false.
 */
export function matchNonWildcardPattern(currentOrigin: string, pattern: string): boolean {
  // If pattern explicitly specifies a scheme, compare origins (ignore path)
  if (pattern.includes('://')) {
    const url = parseUrl(pattern)

    return url ? url.origin === currentOrigin : false
  }

  // Schemeless: treat as hostname[:port]
  const { host, port } = parseSchemelessHostPort(pattern)
  // Extract raw host[:port] from the origin string to preserve case-sensitivity
  const schemeIdx = currentOrigin.indexOf('://')
  if (schemeIdx !== -1) {
    const start = schemeIdx + 3
    let end = currentOrigin.indexOf('/', start)
    if (end === -1) {
      end = currentOrigin.length
    }
    const rawHostPort = currentOrigin.slice(start, end)
    if (port !== undefined) {
      return `${host}:${port}` === rawHostPort
    }

    const rawHostOnly = rawHostPort.split(':')[0]

    return host === rawHostOnly
  }

  // Fallback to URL parsing when origin isn't a standard scheme URL
  const current = parseUrl(currentOrigin)
  if (!current) {
    return false
  }
  if (port !== undefined) {
    return host === current.hostname && port === (current.port || undefined)
  }

  return host === current.hostname
}

/**
 * Checks if the current origin matches a wildcard pattern.
 * @param current - The current origin as a URL object.
 * @param currentOrigin - The current origin as a string.
 * @param pattern - The wildcard pattern string to use.
 * @returns True if matches the wildcard pattern, otherwise false.
 */
export function matchWildcardPattern(
  current: URL,
  currentOrigin: string,
  pattern: string
): boolean {
  // Extract scheme if present and strip path
  let working = pattern
  let scheme: string | undefined = undefined
  const schemeIdx = working.indexOf('://')
  if (schemeIdx !== -1) {
    scheme = working.slice(0, schemeIdx)
    working = working.slice(schemeIdx + 3)
  }
  const slashIdx = working.indexOf('/')
  if (slashIdx !== -1) {
    working = working.slice(0, slashIdx)
  }

  // Split host and optional port
  let hostPart = working
  let portPart: string | undefined = undefined
  const lastColon = hostPart.lastIndexOf(':')
  if (lastColon !== -1) {
    portPart = hostPart.slice(lastColon + 1)
    hostPart = hostPart.slice(0, lastColon)
  }

  // Validate wildcard usage (only full-label '*')
  const patternLabels = hostPart.split('.')
  for (const label of patternLabels) {
    if (label.includes('*') && label !== '*') {
      return false
    }
  }

  // Scheme must match when specified
  const currentScheme = current.protocol.replace(/:$/u, '')
  if (scheme && scheme !== currentScheme) {
    return false
  }

  // Port must match exactly when specified (or '*' allows any)
  if (portPart !== undefined) {
    if (portPart !== '*' && portPart !== current.port) {
      return false
    }
  }

  /**
   * Host must have the same number of labels; '*' matches exactly one label.
   * Uses raw host from the original origin to preserve case-sensitivity.
   */
  const raw = parseOriginRaw(currentOrigin)
  const hostForCompare = raw ? raw.host : current.hostname
  const currentLabels = hostForCompare.split('.')
  if (patternLabels.length !== currentLabels.length) {
    return false
  }

  for (let i = patternLabels.length - 1; i >= 0; i -= 1) {
    const p = patternLabels[i]
    const c = currentLabels[i]
    if (p !== '*' && p !== c) {
      return false
    }
  }

  return true
}
