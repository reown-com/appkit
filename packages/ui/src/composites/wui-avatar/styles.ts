import { css } from 'lit'

export default css`
  :host {
    display: block;
    width: 64px;
    height: 64px;
    outline: 8px solid var(--wui-overlay-gray-005);
    border-radius: var(--wui-border-radius-3xl);
    overflow: hidden;
    position: relative;
  }

  :host([data-variant='generated']) {
    --mixed-local-color-1: color-mix(
      in srgb,
      var(--w3m-color-mix) var(--w3m-color-mix-strength),
      var(--local-color-1)
    );
    --mixed-local-color-2: color-mix(
      in srgb,
      var(--w3m-color-mix) var(--w3m-color-mix-strength),
      var(--local-color-2)
    );
    --mixed-local-color-3: color-mix(
      in srgb,
      var(--w3m-color-mix) var(--w3m-color-mix-strength),
      var(--local-color-3)
    );
    --mixed-local-color-4: color-mix(
      in srgb,
      var(--w3m-color-mix) var(--w3m-color-mix-strength),
      var(--local-color-4)
    );
    --mixed-local-color-5: color-mix(
      in srgb,
      var(--w3m-color-mix) var(--w3m-color-mix-strength),
      var(--local-color-5)
    );

    outline: 8px solid var(--wui-avatar-border);
    background: radial-gradient(
      75.29% 75.29% at 64.96% 24.36%,
      #fff 0.52%,
      var(--local-color-5) 31.25%,
      var(--local-color-3) 51.56%,
      var(--local-color-2) 65.63%,
      var(--local-color-1) 82.29%,
      var(--local-color-4) 100%
    );
    background: radial-gradient(
      75.29% 75.29% at 64.96% 24.36%,
      #fff 0.52%,
      var(--mixed-local-color-5) 31.25%,
      var(--mixed-local-color-3) 51.56%,
      var(--mixed-local-color-2) 65.63%,
      var(--mixed-local-color-1) 82.29%,
      var(--mixed-local-color-4) 100%
    );
  }

  :host([data-variant='default']) {
    outline: 8px solid var(--wui-avatar-border);
    background: radial-gradient(
      75.29% 75.29% at 64.96% 24.36%,
      #fff 0.52%,
      #f5ccfc 31.25%,
      #dba4f5 51.56%,
      #9a8ee8 65.63%,
      #6493da 82.29%,
      #6ebdea 100%
    );
  }
`
