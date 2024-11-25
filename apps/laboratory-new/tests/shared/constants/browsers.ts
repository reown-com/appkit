export const BRAVE_MACOS_PATH = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
export const BRAVE_LINUX_PATH = '/usr/bin/brave-browser'
export const BRAVE_WINDOWS_PATH =
  'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'

export function getLocalBravePath(): string {
  switch (process.platform) {
    case 'linux':
      return BRAVE_LINUX_PATH
    case 'win32':
      return BRAVE_WINDOWS_PATH
    default:
      return BRAVE_MACOS_PATH
  }
}
