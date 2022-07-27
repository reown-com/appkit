import { Component, h, Prop } from '@stencil/core'

@Component({
  tag: 'connect-button',
  styleUrl: 'styles.css',
  shadow: true
})
export class ConnectButton {
  @Prop() label = ''

  render() {
    return <button>{this.label}</button>
  }
}
