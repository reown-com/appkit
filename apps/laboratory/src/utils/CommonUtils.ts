export function parseJSON(str: string) {
  try {
    return JSON.parse(str)
  } catch (error) {
    return { error: `Invalid JSON: ${error}` }
  }
}

export function bigIntReplacer(_key: string, value: bigint) {
  if (typeof value === 'bigint') {
    return value.toString()
  }

  return value
}
