import React, { type CSSProperties, forwardRef } from 'react'

import classNames from 'classnames'

export interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  active?: {
    fill: string
    background: string
  }
  cursor?: CSSProperties['cursor']
}

export const Action = forwardRef<HTMLButtonElement, Props>(
  ({ active, className, cursor, style, ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      className={classNames(className)}
      tabIndex={0}
      style={
        {
          ...style,
          cursor,
          '--fill': active?.fill,
          '--background': active?.background
        } as CSSProperties
      }
    />
  )
)
