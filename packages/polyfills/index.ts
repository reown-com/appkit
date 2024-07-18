import { Buffer } from 'buffer'

if (typeof window !== 'undefined') {
  if (typeof window['Buffer'] === 'undefined') {
    window.Buffer = Buffer
  }

  if (typeof window['global'] === 'undefined') {
    window.global = window
  }

  if (typeof window['process'] === 'undefined') {
    // @ts-expect-error minimal process
    window.process = {}
  }

  if (!window.process?.env) {
    // @ts-expect-error minimal process
    window.process = { env: {} }
  }
}
