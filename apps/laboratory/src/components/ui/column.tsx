import * as React from 'react'

import { cn } from '@/lib/utils'

export interface ColumnProps extends React.HTMLAttributes<HTMLDivElement> {}

const Column = React.forwardRef<HTMLDivElement, ColumnProps>(({ className, ...props }, ref) => {
  return <div className={cn('flex flex-col', className)} ref={ref} {...props} />
})
Column.displayName = 'Column'

export { Column }
