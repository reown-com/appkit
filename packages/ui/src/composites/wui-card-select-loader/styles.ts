import { css } from 'lit'

export default css`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    row-gap: var(--wui-spacing-xs);
    padding: 8px 10px;
    background-color: var(--wui-overlay-002);
    border-radius: var(--wui-border-radius-xs);
    position: relative;
  }

  wui-shimmer[type='network'] {
    border: none;
    width: 48px;
    height: 54px;
    -webkit-clip-path: path(
      'M20.041 1.061a7.915 7.915 0 0 1 7.918 0l16.082 9.29A7.922 7.922 0 0 1 48 17.21v18.578c0 2.83-1.51 5.445-3.959 6.86l-16.082 9.29a7.915 7.915 0 0 1-7.918 0l-16.082-9.29A7.922 7.922 0 0 1 0 35.79V17.211c0-2.83 1.51-5.445 3.959-6.86l16.082-9.29Z'
    );
    clip-path: path(
      'M20.041 1.061a7.915 7.915 0 0 1 7.918 0l16.082 9.29A7.922 7.922 0 0 1 48 17.21v18.578c0 2.83-1.51 5.445-3.959 6.86l-16.082 9.29a7.915 7.915 0 0 1-7.918 0l-16.082-9.29A7.922 7.922 0 0 1 0 35.79V17.211c0-2.83 1.51-5.445 3.959-6.86l16.082-9.29Z'
    );
  }

  svg {
    position: absolute;
    width: 48px;
    height: 54px;
    z-index: 1;
  }

  svg > path {
    stroke: var(--wui-overlay-010);
    stroke-width: 1px;
  }
`
