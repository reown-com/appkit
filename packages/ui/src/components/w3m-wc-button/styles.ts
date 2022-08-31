import { css, html } from 'lit'

export default css`
  .w3m-wc-button-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .w3m-wc-button-carousel {
    height: 60px;
    border-radius: 18px;
    position: relative;
  }
`

export function dynamicStyles() {
  return html`<style></style>`
}
