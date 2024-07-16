import { vi } from 'vitest'

export class W3mFrame {
  private frameLoadPromise: Promise<void>
  private projectId: string
  private isAppClient: boolean
  private iframe: HTMLIFrameElement | null
  public events: {
    onAppEvent: typeof vi.fn
    onFrameEvent: typeof vi.fn
    postAppEvent: typeof vi.fn
    registerFrameEventHandler: typeof vi.fn
  }

  constructor(projectId: string, isAppClient: boolean) {
    this.projectId = projectId
    this.isAppClient = isAppClient
    this.events = {
      onAppEvent: vi.fn(),
      onFrameEvent: vi.fn(),
      postAppEvent: vi.fn(),
      registerFrameEventHandler: vi.fn()
    }
    this.frameLoadPromise = Promise.resolve()
    this.iframe = {
      contentWindow: {
        postMessage: vi.fn()
      }
    } as unknown as HTMLIFrameElement
  }
}
