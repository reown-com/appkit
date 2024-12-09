import React from 'react'

import styles from './social-options-grid.module.css'

export interface Props {
  children: React.ReactNode
  columns: number
}

export function SocialOptionsGrid({ children, columns }: Props) {
  return (
    <ul className={styles.GridContainer} style={{ '--col-count': columns } as React.CSSProperties}>
      {children}
    </ul>
  )
}
