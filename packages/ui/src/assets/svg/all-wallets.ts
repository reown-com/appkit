import { svg } from 'lit'

export const allWalletsSvg = svg`<svg fill="none" viewBox="0 0 40 40">
  <g clip-path="url(#a)">
    <mask
      id="b"
      width="40"
      height="40"
      x="0"
      y="0"
      maskUnits="userSpaceOnUse"
      style="mask-type:luminance"
    >
      <path fill="#fff" d="M40 0H0v40h40V0Z" />
    </mask>
    <g mask="url(#b)">
      <path
				style="fill: var(--wui-color-accent-010);"
        d="M0 16.6c0-6.17 0-9.25 1.31-11.55A10 10 0 0 1 5.05 1.3C7.35 0 10.43 0 16.6 0h6.8c6.17 0 9.25 0 11.55 1.31a10 10 0 0 1 3.74 3.74C40 7.35 40 10.43 40 16.6v6.8c0 6.17 0 9.25-1.31 11.55a10 10 0 0 1-3.74 3.74C32.65 40 29.57 40 23.4 40h-6.8c-6.17 0-9.25 0-11.55-1.31a10 10 0 0 1-3.74-3.74C0 32.65 0 29.57 0 23.4v-6.8Z"
      />
      <path
				style="fill: var(--wui-color-accent-100);"
        d="M18.2 14.6a3.6 3.6 0 1 1-7.2 0 3.6 3.6 0 0 1 7.2 0Zm10.8 0a3.6 3.6 0 1 1-7.2 0 3.6 3.6 0 0 1 7.2 0ZM18.2 25.4a3.6 3.6 0 1 1-7.2 0 3.6 3.6 0 0 1 7.2 0Zm10.8 0a3.6 3.6 0 1 1-7.2 0 3.6 3.6 0 0 1 7.2 0Z"
      />
    </g>
  </g>
  <defs>
    <clipPath id="a"><path fill="#fff" d="M0 0h40v40H0z" /></clipPath>
  </defs>
</svg>`
