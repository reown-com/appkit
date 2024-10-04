import React from 'react'
import { GetServerSideProps } from 'next'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

interface Props {
  data: string
}

export default function Page2({ data }: Props) {
  const { address } = useAppKitAccount()
  const { open } = useAppKit()

  return (
    <div className="page-container">
      <span>Address: {address}</span>
      <span>Server side data: {data}</span>
      <button onClick={() => open()}>Open AppKit</button>
      <w3m-button />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async context => {
  return {
    props: {
      data: 'Example data from the server side'
    }
  }
}
