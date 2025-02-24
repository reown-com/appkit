import type { JSX } from 'react'

import clsx from 'clsx'

import * as resetStyles from './reset.css'
import type { Sprinkles } from './sprinkless.css'
import { sprinkles } from './sprinkless.css'

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type Atoms = Sprinkles & {
  reset?: keyof JSX.IntrinsicElements
}

export function atoms({ reset, ...rest }: Atoms) {
  if (!reset) {
    return sprinkles(rest)
  }

  const elementReset = resetStyles.element[reset as keyof typeof resetStyles.element]

  const sprinklesClasses = sprinkles(rest)

  return clsx(elementReset, sprinklesClasses)
}
