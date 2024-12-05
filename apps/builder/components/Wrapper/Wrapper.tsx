import React from 'react'
import classNames from 'classnames'

import styles from './Wrapper.module.css'

interface Props {
  children: React.ReactNode
  center?: boolean
  style?: React.CSSProperties
  className?: string
}

export function Wrapper({ children, center, style, className }: Props) {
  return (
    <div
      className={classNames(styles.Wrapper, center && styles.center, 'relative', className)}
      style={style}
    >
      {children}
    </div>
  )
}
