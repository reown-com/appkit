import React, { forwardRef } from 'react'

import { cn } from '@/lib/utils'

export interface Props {
  children: React.ReactNode
  columns?: number
  style?: React.CSSProperties
  horizontal?: boolean
}

export const List = forwardRef<HTMLUListElement, Props>(
  ({ children, columns = 1, horizontal }: Props, ref) => {
    return (
      <ul
        ref={ref}
        className={cn(
          'grid w-full box-border gap-[10px] pb-0 rounded-[5px] transition-colors duration-350 ease-in-out',
          `grid-cols-${columns}`,
          horizontal && 'grid-flow-col'
        )}
      >
        {children}
      </ul>
    )
  }
)
