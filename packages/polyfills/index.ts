/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buffer } from 'buffer'

if (typeof window !== 'undefined') {
  if (!window.Buffer) {
    ;(window as any).Buffer = Buffer
  }
  if (!window.global) {
    ;(window as any).global = window
  }
  if (!window.process) {
    ;(window as any).process = {}
  }
  if (!window.process?.env) {
    // @ts-expect-error minimal process
    window.process = { env: {} }
  }
}
