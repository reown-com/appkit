import { html } from 'lit'

export default html`
  <svg id="w3m-transparent-noise">
    <filter id="w3m-noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" />
    </filter>

    <rect width="100%" height="100%" filter="url(#w3m-noise)" />
  </svg>
`
