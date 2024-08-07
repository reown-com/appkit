import { vi } from 'vitest'

export const W3mFrameStorage = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn()
}
