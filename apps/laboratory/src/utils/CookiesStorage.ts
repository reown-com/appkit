import Cookies from 'js-cookie'

function sanitizeCookieKey(key: string): string {
  return key.replace('@', '').replace('/', '.')
}

export const CookiesStorage: any = {
  getItem(key: string): string | null {
    const cookieKey = sanitizeCookieKey(key)
    const value = Cookies.get(cookieKey)
    return value ?? null
  },

  setItem(key: string, value: string): void {
    const cookieKey = sanitizeCookieKey(key)
    Cookies.set(cookieKey, value)
  },

  removeItem(key: string): void {
    const cookieKey = sanitizeCookieKey(key)
    Cookies.remove(cookieKey)
  }
}
