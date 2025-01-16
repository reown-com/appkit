import React from 'react'

import classNames from 'classnames'

interface Props {
  children: React.ReactNode
  center?: boolean
  style?: React.CSSProperties
  className?: string
}

export function Wrapper({ children, center, style, className }: Props) {
  return (
    <div
      className={classNames(
        'flex w-full box-border justify-start',
        center && 'justify-center',
        'relative',
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}
