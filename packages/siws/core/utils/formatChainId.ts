export function formatChainId(name: string | undefined): string {
  if (!name) {
    return ''
  }
  const [base = '', suffix = ''] = name.split(' ')

  return suffix ? `${base.toLowerCase()}:${suffix.toLowerCase()}` : base.toLowerCase()
}
