import * as React from 'react'

import { cn } from '@/lib/utils'

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {}

const Row = React.forwardRef<HTMLDivElement, RowProps>(({ className, ...props }, ref) => {
  return <div className={cn('flex flex-row', className)} ref={ref} {...props} />
})
Row.displayName = 'Row'

export { Row }
