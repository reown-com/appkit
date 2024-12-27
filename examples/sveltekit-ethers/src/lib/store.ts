import { writable } from 'svelte/store'

export const accountState = writable({})
export const networkState = writable({})
export const appKitState = writable({})
export const themeState = writable({ themeMode: 'light', themeVariables: {} })
export const events = writable([])
export const walletInfo = writable({})
