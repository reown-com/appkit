import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css``

export function dynamicStyles() {
  const { background } = color()

  return html`<style></style>`
}
