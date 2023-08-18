import { Buffer } from 'buffer'

if (typeof window !== 'undefined') {
  if (!window.Buffer) {
    window.Buffer = Buffer
  }
  if (!window.global) {
    window.global = window
  }
  if (!window.process) {
    // @ts-expect-error minimal process
    window.process = {}
  }
  if (!window.process?.env) {
    // @ts-expect-error minimal process
    window.process = { env: {} }
  }
}
