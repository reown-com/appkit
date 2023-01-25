export function getVersionFromUrl(): '1' | '2' {
  if (typeof window === 'undefined') {
    return '1'
  }
  const url = new URL(window.location.href)

  // @ts-expect-error Version is 2 or 1
  return url.searchParams.get('version') ?? '1'
}
