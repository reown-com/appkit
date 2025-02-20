export const SystemUtil = {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  canUseProcessEnv: typeof process !== 'undefined' && typeof process.env !== 'undefined',
  getEnv: (key: string, defaultValue: string): string =>
    (SystemUtil.canUseProcessEnv ? process.env[key] : undefined) || defaultValue
}
