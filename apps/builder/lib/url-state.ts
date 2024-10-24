type Features = {
  email?: boolean
  socials?: string[] | false
  emailShowWallets?: boolean
}

type ThemeMode = 'dark' | 'light'

export function getStateFromUrl(): { features: Features; themeMode: ThemeMode } {
  if (typeof window === 'undefined') return { features: {}, themeMode: 'light' }

  const params = new URLSearchParams(window.location.search)
  const stateParam = params.get('state')

  if (!stateParam) return { features: {}, themeMode: 'light' }

  try {
    return JSON.parse(decodeURIComponent(stateParam))
  } catch (e) {
    console.error('Failed to parse state from URL:', e)
    return { features: {}, themeMode: 'light' }
  }
}

export function updateUrlState(features: Features, themeMode: ThemeMode) {
  if (typeof window === 'undefined') return

  const state = { features, themeMode }
  const params = new URLSearchParams(window.location.search)

  params.set('state', encodeURIComponent(JSON.stringify(state)))

  const newUrl = `${window.location.pathname}?${params.toString()}`
  window.history.replaceState({}, '', newUrl)
}
