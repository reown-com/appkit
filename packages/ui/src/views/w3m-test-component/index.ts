import { html, LitElement } from 'lit'
import { ExplorerCtrl } from '@web3modal/core'

import { customElement } from 'lit/decorators.js'

@customElement('w3m-test-component')
export default class W3mTestComponent extends LitElement {
  protected render() {
    ExplorerCtrl.init({ projectId: '6a8d17fb-6d30-4450-9ed8-3cbb2771483a' })
    ExplorerCtrl.getAll({}).then(console.log)

    return html`<div><p>test</p></div>`
  }
}
