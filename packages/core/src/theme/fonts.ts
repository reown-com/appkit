import { unsafeCSS } from 'lit'

export default function fonts(family?: string) {
  return {
    fontFamily: unsafeCSS(
      `font-family: ${
        family ?? `"SF Pro", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
      };`
    )
  }
}
