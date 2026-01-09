import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  slot {
    width: 100%;
    display: inline-block;
    font-style: normal;
    overflow: inherit;
    text-overflow: inherit;
    text-align: var(--local-align);
    color: var(--local-color);
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
    font-size: ${({ textSize }) => textSize.h1};
    line-height: ${({ typography }) => typography['h1-regular-mono'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h1-regular-mono'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-h1-regular {
    font-size: ${({ textSize }) => textSize.h1};
    line-height: ${({ typography }) => typography['h1-regular'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h1-regular'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-h1-medium {
    font-size: ${({ textSize }) => textSize.h1};
    line-height: ${({ typography }) => typography['h1-medium'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h1-medium'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-h2-regular-mono {
    font-size: ${({ textSize }) => textSize.h2};
    line-height: ${({ typography }) => typography['h2-regular-mono'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h2-regular-mono'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-h2-regular {
    font-size: ${({ textSize }) => textSize.h2};
    line-height: ${({ typography }) => typography['h2-regular'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h2-regular'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-h2-medium {
    font-size: ${({ textSize }) => textSize.h2};
    line-height: ${({ typography }) => typography['h2-medium'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h2-medium'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-h3-regular-mono {
    font-size: ${({ textSize }) => textSize.h3};
    line-height: ${({ typography }) => typography['h3-regular-mono'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h3-regular-mono'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-h3-regular {
    font-size: ${({ textSize }) => textSize.h3};
    line-height: ${({ typography }) => typography['h3-regular'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h3-regular'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-h3-medium {
    font-size: ${({ textSize }) => textSize.h3};
    line-height: ${({ typography }) => typography['h3-medium'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h3-medium'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-h4-regular-mono {
    font-size: ${({ textSize }) => textSize.h4};
    line-height: ${({ typography }) => typography['h4-regular-mono'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h4-regular-mono'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-h4-regular {
    font-size: ${({ textSize }) => textSize.h4};
    line-height: ${({ typography }) => typography['h4-regular'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h4-regular'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-h4-medium {
    font-size: ${({ textSize }) => textSize.h4};
    line-height: ${({ typography }) => typography['h4-medium'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h4-medium'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-h5-regular-mono {
    font-size: ${({ textSize }) => textSize.h5};
    line-height: ${({ typography }) => typography['h5-regular-mono'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h5-regular-mono'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-h5-regular {
    font-size: ${({ textSize }) => textSize.h5};
    line-height: ${({ typography }) => typography['h5-regular'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h5-regular'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-h5-medium {
    font-size: ${({ textSize }) => textSize.h5};
    line-height: ${({ typography }) => typography['h5-medium'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h5-medium'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-h6-regular-mono {
    font-size: ${({ textSize }) => textSize.h6};
    line-height: ${({ typography }) => typography['h6-regular-mono'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h6-regular-mono'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-h6-regular {
    font-size: ${({ textSize }) => textSize.h6};
    line-height: ${({ typography }) => typography['h6-regular'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h6-regular'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-h6-medium {
    font-size: ${({ textSize }) => textSize.h6};
    line-height: ${({ typography }) => typography['h6-medium'].lineHeight};
    letter-spacing: ${({ typography }) => typography['h6-medium'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-lg-regular-mono {
    font-size: ${({ textSize }) => textSize.large};
    line-height: ${({ typography }) => typography['lg-regular-mono'].lineHeight};
    letter-spacing: ${({ typography }) => typography['lg-regular-mono'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-lg-regular {
    font-size: ${({ textSize }) => textSize.large};
    line-height: ${({ typography }) => typography['lg-regular'].lineHeight};
    letter-spacing: ${({ typography }) => typography['lg-regular'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-lg-medium {
    font-size: ${({ textSize }) => textSize.large};
    line-height: ${({ typography }) => typography['lg-medium'].lineHeight};
    letter-spacing: ${({ typography }) => typography['lg-medium'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-md-regular-mono {
    font-size: ${({ textSize }) => textSize.medium};
    line-height: ${({ typography }) => typography['md-regular-mono'].lineHeight};
    letter-spacing: ${({ typography }) => typography['md-regular-mono'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-md-regular {
    font-size: ${({ textSize }) => textSize.medium};
    line-height: ${({ typography }) => typography['md-regular'].lineHeight};
    letter-spacing: ${({ typography }) => typography['md-regular'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-md-medium {
    font-size: ${({ textSize }) => textSize.medium};
    line-height: ${({ typography }) => typography['md-medium'].lineHeight};
    letter-spacing: ${({ typography }) => typography['md-medium'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-sm-regular-mono {
    font-size: ${({ textSize }) => textSize.small};
    line-height: ${({ typography }) => typography['sm-regular-mono'].lineHeight};
    letter-spacing: ${({ typography }) => typography['sm-regular-mono'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-font-sm-regular {
    font-size: ${({ textSize }) => textSize.small};
    line-height: ${({ typography }) => typography['sm-regular'].lineHeight};
    letter-spacing: ${({ typography }) => typography['sm-regular'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.regular};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }

  .wui-font-sm-medium {
    font-size: ${({ textSize }) => textSize.small};
    line-height: ${({ typography }) => typography['sm-medium'].lineHeight};
    letter-spacing: ${({ typography }) => typography['sm-medium'].letterSpacing};
    font-weight: ${({ fontWeight }) => fontWeight.medium};
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-feature-settings:
      'liga' off,
      'clig' off;
  }
`
