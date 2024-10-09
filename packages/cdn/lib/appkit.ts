import '@reown/appkit-polyfills'
import { createAppKit, AppKit, CoreHelperUtil, AccountController } from '@reown/appkit'

console.log('AppKit module loading...')

// Export the createAppKit function and other necessary exports
export { createAppKit, AppKit, CoreHelperUtil, AccountController }

// If you're using a global object, make sure it's properly defined
declare global {
  interface Window {
    AppKit: {
      createAppKit: typeof createAppKit
      AppKit: typeof AppKit
      CoreHelperUtil: typeof CoreHelperUtil
      AccountController: typeof AccountController
    }
  }
}

// Assign to window.AppKit
if (typeof window !== 'undefined') {
  console.log('Assigning AppKit to window...')
  window.AppKit = {
    createAppKit,
    AppKit,
    CoreHelperUtil,
    AccountController
  }
  console.log('AppKit assigned to window')
} else {
  console.log('Window object not available')
}

console.log('AppKit module loaded')
