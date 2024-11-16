import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: inline-flex !important;
  }

  slot {
    width: 100%;
    display: inline-block;
    font-style: normal;
    font-feature-settings:
      'tnum' on,
      'lnum' on,
      'case' on;
    overflow: inherit;
    text-overflow: inherit;
  }

  .wui-line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .wui-line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  /* -- Headings --------------------------------------------------- */
  .wui-font-h1-regular-mono {
    font-size: ${({ textSizes }) => textSizes.h1};
    line-height: ${({ lineHeight }) => lineHeight['h1-regular-mono']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h1-regular-mono']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-h1-regular {
    font-size: ${({ textSizes }) => textSizes.h1};
    line-height: ${({ lineHeight }) => lineHeight['h1-regular']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h1-regular']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-h1-medium {
    font-size: ${({ textSizes }) => textSizes.h1};
    line-height: ${({ lineHeight }) => lineHeight['h1-medium']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h1-medium']};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-h2-regular-mono {
    font-size: ${({ textSizes }) => textSizes.h2};
    line-height: ${({ lineHeight }) => lineHeight['h2-regular-mono']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h2-regular-mono']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-h2-regular {
    font-size: ${({ textSizes }) => textSizes.h2};
    line-height: ${({ lineHeight }) => lineHeight['h2-regular']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h2-regular']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-h2-medium {
    font-size: ${({ textSizes }) => textSizes.h2};
    line-height: ${({ lineHeight }) => lineHeight['h2-medium']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h2-medium']};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-h3-regular-mono {
    font-size: ${({ textSizes }) => textSizes.h3};
    line-height: ${({ lineHeight }) => lineHeight['h3-regular-mono']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h3-regular-mono']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-h3-regular {
    font-size: ${({ textSizes }) => textSizes.h3};
    line-height: ${({ lineHeight }) => lineHeight['h3-regular']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h3-regular']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-h3-medium {
    font-size: ${({ textSizes }) => textSizes.h3};
    line-height: ${({ lineHeight }) => lineHeight['h3-medium']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h3-medium']};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-h4-regular-mono {
    font-size: ${({ textSizes }) => textSizes.h4};
    line-height: ${({ lineHeight }) => lineHeight['h4-regular-mono']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h4-regular-mono']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-h4-regular {
    font-size: ${({ textSizes }) => textSizes.h4};
    line-height: ${({ lineHeight }) => lineHeight['h4-regular']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h4-regular']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-h4-medium {
    font-size: ${({ textSizes }) => textSizes.h4};
    line-height: ${({ lineHeight }) => lineHeight['h4-medium']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h4-medium']};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-h5-regular-mono {
    font-size: ${({ textSizes }) => textSizes.h5};
    line-height: ${({ lineHeight }) => lineHeight['h5-regular-mono']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h5-regular-mono']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-h5-regular {
    font-size: ${({ textSizes }) => textSizes.h5};
    line-height: ${({ lineHeight }) => lineHeight['h5-regular']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h5-regular']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-h5-medium {
    font-size: ${({ textSizes }) => textSizes.h5};
    line-height: ${({ lineHeight }) => lineHeight['h5-medium']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h5-medium']};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-h6-regular-mono {
    font-size: ${({ textSizes }) => textSizes.h6};
    line-height: ${({ lineHeight }) => lineHeight['h6-regular-mono']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h6-regular-mono']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-h6-regular {
    font-size: ${({ textSizes }) => textSizes.h6};
    line-height: ${({ lineHeight }) => lineHeight['h6-regular']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h6-regular']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-h6-medium {
    font-size: ${({ textSizes }) => textSizes.h6};
    line-height: ${({ lineHeight }) => lineHeight['h6-medium']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['h6-medium']};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-lg-regular-mono {
    font-size: ${({ textSizes }) => textSizes.large};
    line-height: ${({ lineHeight }) => lineHeight['lg-regular-mono']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['lg-regular-mono']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-lg-regular {
    font-size: ${({ textSizes }) => textSizes.large};
    line-height: ${({ lineHeight }) => lineHeight['lg-regular']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['lg-regular']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-lg-medium {
    font-size: ${({ textSizes }) => textSizes.large};
    line-height: ${({ lineHeight }) => lineHeight['lg-medium']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['lg-medium']};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-md-regular-mono {
    font-size: ${({ textSizes }) => textSizes.medium};
    line-height: ${({ lineHeight }) => lineHeight['md-regular-mono']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['md-regular-mono']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-md-regular {
    font-size: ${({ textSizes }) => textSizes.medium};
    line-height: ${({ lineHeight }) => lineHeight['md-regular']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['md-regular']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-md-medium {
    font-size: ${({ textSizes }) => textSizes.medium};
    line-height: ${({ lineHeight }) => lineHeight['md-medium']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['md-medium']};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-sm-regular-mono {
    font-size: ${({ textSizes }) => textSizes.small};
    line-height: ${({ lineHeight }) => lineHeight['sm-regular-mono']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['sm-regular-mono']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-sm-regular {
    font-size: ${({ textSizes }) => textSizes.small};
    line-height: ${({ lineHeight }) => lineHeight['sm-regular']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['sm-regular']};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }

  .wui-font-sm-medium {
    font-size: ${({ textSizes }) => textSizes.small};
    line-height: ${({ lineHeight }) => lineHeight['sm-medium']};
    letter-spacing: ${({ letterSpacing }) => letterSpacing['sm-medium']};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
  }
`
