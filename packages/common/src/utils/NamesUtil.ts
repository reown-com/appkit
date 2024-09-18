import { ConstantsUtil } from './ConstantsUtil.js'

export function isReownName(value: string) {
  return (
    value?.endsWith(ConstantsUtil.WC_NAME_SUFFIX_LEGACY) ||
    value?.endsWith(ConstantsUtil.WC_NAME_SUFFIX)
  )
}
