import { W3mFrame } from './W3mFrame.js'

export class W3mFrameProvider {
  private w3mFrame: W3mFrame

  public constructor(projectId: string) {
    this.w3mFrame = new W3mFrame(projectId)
  }
}
