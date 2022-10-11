/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Buffer } from 'buffer'

if (typeof window !== 'undefined') {
  if (!window.Buffer) window.Buffer = Buffer
  if (!window.global) window.global = window
  // @ts-expect-error minimal process
  if (!window.process) window.process = { env: {} }
}
