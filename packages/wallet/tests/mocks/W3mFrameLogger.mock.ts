import { vi } from 'vitest'

export class W3mFrameLogger {
  private projectId: string
  public logger: {
    info: typeof vi.fn
    error: typeof vi.fn
  }

  constructor(projectId) {
    this.projectId = projectId
    this.logger = {
      info: vi.fn(),
      error: vi.fn()
    }
  }
}
