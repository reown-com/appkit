import { html } from 'lit'

export default html`
  <svg width="24" height="24" color="#3f51b5" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1">
        <stop offset="0%" stop-opacity="0" stop-color="currentColor" />
        <stop offset="100%" stop-opacity="0.5" stop-color="currentColor" />
      </linearGradient>
      <linearGradient id="grad2">
        <stop offset="0%" stop-opacity="1" stop-color="currentColor" />
        <stop offset="100%" stop-opacity="0.5" stop-color="currentColor" />
      </linearGradient>
    </defs>

    <g stroke-width="8">
      <path stroke="url(#grad1)" d="M 4 100 A 96 96 0 0 1 196 100" />
      <path stroke="url(#grad2)" d="M 196 100 A 96 96 0 0 1 4 100" />
      <path stroke="currentColor" stroke-linecap="round" d="M 4 100 A 96 96 0 0 1 4 98" />
    </g>
  </svg>
`
