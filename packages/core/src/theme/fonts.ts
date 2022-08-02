import { unsafeCSS } from 'lit'

export default function fonts(family?: string) {
  return {
    fontFamily: unsafeCSS(
      `font-family: ${
        family ??
        `-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif;`
      };`
    )
  }
}
