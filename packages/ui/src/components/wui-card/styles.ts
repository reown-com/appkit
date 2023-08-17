import { css } from 'lit'

export default css`
  :host {
    display: block;
    border-radius: var(--wui-border-radius-l);
    border: 1px solid var(--wui-overlay-005);
    background-color: var(--wui-color-bg-125);
    background-color: color-mix(
      in srgb,
      var(--wui-color-bg-125) var(--w3m-background-percentage),
      var(--w3m-accent)
    );

    overflow: hidden;
  }
`
