export function getValue<T, R>(ciValue: T, defaultValue: R): T | R {
  if (process.env['CI']) {
    return ciValue
  }

  return defaultValue
}
