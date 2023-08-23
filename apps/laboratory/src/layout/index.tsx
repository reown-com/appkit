import type { ReactNode } from 'react'
import Header from './Header'

type Props = {
  children: ReactNode | ReactNode[]
}

export default function Layout({ children }: Props) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}
