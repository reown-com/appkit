export function parseJSON(str: string) {
  try {
    return JSON.parse(str)
  } catch (error) {
    return { error: `Invalid JSON: ${error}` }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function bigIntReplacer(_key: string, value: any) {
  if (typeof value === 'bigint') {
    return `0x${value.toString(16)}`
  }

  return value
}
