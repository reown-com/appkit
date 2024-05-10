export function parseJSON(str: string) {
  try {
    return JSON.parse(str)
  } catch (error) {
    return { error:`Invalid JSON: ${error}` }
  }
}