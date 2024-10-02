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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        height: '100vh'
      }}
    >
      <span>Address: {address}</span>
      <span>Server side data: {data}</span>
      <button onClick={() => open()}>Open AppKit</button>
      <w3m-button />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async context => {
  console.log(context)

  return {
    props: {
      data: '1111'
    }
  }
}
