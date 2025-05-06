import { proxy } from 'valtio/vanilla'

import type { AppKit } from '@reown/appkit'

export const AppKitStore = proxy<{
  appKit: AppKit | undefined
}>({
  appKit: undefined
})

export function setAppKit(appKit: AppKit) {
  AppKitStore.appKit = appKit
}
