export interface SessionParams {
  reqAccounts: string[]
  optAccounts: string[]
  accept: boolean
}

export interface UseOptions {
  launchOptions: {
    executablePath: string
  }
}

export interface CustomProperties {
  testIgnore?: RegExp | string
  testMatch?: RegExp | string
  useOptions?: UseOptions
  grep?: RegExp
}

export type CustomProjectProperties = {
  [T in string]: CustomProperties
}

export interface Permutation {
  device: string
  library: string
}

export interface CreateProjectParameters {
  device: string
  library: string
}
