import { css } from 'lit'

export default css`
  :host {
    position: relative;
    border-radius: inherit;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
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
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  svg > path {
    stroke: var(--wui-overlay-010);
    stroke-width: 2px;
  }

  wui-image {
    width: 100%;
    height: 100%;
  }

  wui-icon {
    width: 24px;
    height: 24px;
  }
`
