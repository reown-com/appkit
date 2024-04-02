import * as React from 'react'

import { cn } from '@/lib/utils'

const Row = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn('flex flex-row', className)} ref={ref} {...props} />
  }
)
Row.displayName = 'Row'

export { Row }
