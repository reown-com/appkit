import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  .container {
    display: block;
    overflow: hidden;
    overflow: hidden;
    position: relative;
    height: var(--new-height);
    transition: height var(--wui-router-container-transition-duration)
      var(--wui-router-container-transition-function);
    width: var(--apkt-modal-width);
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    width: var(--apkt-modal-width);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  div.page[view-direction='prev'] {
    animation:
      slide-left-out var(--wui-router-container-transition-duration) forwards
        var(--wui-router-container-transition-function),
      slide-left-in var(--wui-router-container-transition-duration) forwards
        var(--wui-router-container-transition-function);
    animation-delay: 0ms, 200ms;
  }

  div.page[view-direction='next'] {
    animation:
      slide-right-out var(--wui-router-container-transition-duration) forwards
        var(--wui-router-container-transition-function),
      slide-right-in var(--wui-router-container-transition-duration) forwards
        var(--wui-router-container-transition-function);
    animation-delay: 0ms, 200ms;
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(6px) scale(0.98);
      opacity: 0;
      filter: blur(2px);
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-6px) scale(0.98);
      opacity: 0;
      filter: blur(2px);
    }
    to {
      transform: translateX(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(-6px) scale(0.98);
      opacity: 0;
      filter: blur(2px);
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(6px) scale(0.98);
      opacity: 0;
      filter: blur(2px);
    }
    to {
      transform: translateX(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
`
