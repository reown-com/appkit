import { type AllHTMLAttributes, type ElementType, createElement, forwardRef } from 'react'

import clsx, { type ClassValue } from 'clsx'

import { type Atoms, atoms } from '../../css/atoms'
import { sprinkles } from '../../css/sprinkless.css'

type HTMLProperties = Omit<AllHTMLAttributes<HTMLElement>, 'as' | 'className'>

type Props = Atoms &
  HTMLProperties & {
    as?: ElementType
    testId?: string
    className?: ClassValue
  }

export const Box = forwardRef<HTMLElement, Props>(
  ({ as = 'div', testId, className, ...props }: Props, ref) => {
    const atomProps: Record<string, unknown> = {}
    const nativeProps: Record<string, unknown> = {}

    for (const key in props) {
      if (sprinkles.properties.has(key as keyof Omit<Atoms, 'reset'>)) {
        atomProps[key] = props[key as keyof typeof props]
      } else {
        nativeProps[key] = props[key as keyof typeof props]
      }
    }

    const atomicClasses = atoms({
      reset: typeof as === 'string' ? (as as Atoms['reset']) : 'div',
      ...atomProps
    })

    return createElement(as, {
      className: clsx(atomicClasses, className),
      'data-testid': testId,
      ...nativeProps,
      ref
    })
  }
)

export type BoxProps = Parameters<typeof Box>[0]

Box.displayName = 'Box'
