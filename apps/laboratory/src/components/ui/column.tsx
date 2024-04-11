import * as React from 'react'

import { cn } from '@/lib/utils'

const Column = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn('flex flex-col', className)} ref={ref} {...props} />
  }
)
Column.displayName = 'Column'

export { Column }
