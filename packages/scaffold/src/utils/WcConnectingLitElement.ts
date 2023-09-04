import {
  ConnectionController,
  CoreHelperUtil,
  RouterController,
  SnackController
} from '@web3modal/core'
import { LitElement } from 'lit'
import { property, state } from 'lit/decorators.js'

export class WcConnectingLitElement extends LitElement {
  // -- Members ------------------------------------------- //
  protected readonly wallet = RouterController.state.data?.wallet

  protected unsubscribe: (() => void)[] = []

  protected timeout?: ReturnType<typeof setTimeout> = undefined

  // -- State & Properties -------------------------------- //
  @property() public onRetry?: (() => void) | (() => Promise<void>) = undefined

  @state() protected uri = ConnectionController.state.wcUri

  @state() protected error = ConnectionController.state.wcError

  @state() protected ready = false

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ConnectionController.subscribeKey('wcUri', val => (this.uri = val)),
        ConnectionController.subscribeKey('wcError', val => (this.error = val))
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    clearTimeout(this.timeout)
  }

  // -- Protected ----------------------------------------- //
  protected onCopyUri() {
    try {
      if (this.uri) {
        CoreHelperUtil.copyToClopboard(this.uri)
        SnackController.showSuccess('Link copied')
      }
    } catch {
      SnackController.showError('Failed to copy')
    }
  }
}
