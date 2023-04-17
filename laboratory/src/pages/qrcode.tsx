import { QrCode } from '@web3modal/react'
import { useState } from 'react'

export default function qrcode() {
  const [uri] = useState('https://walletconnect.com')

  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: '5em' }}>
      <QrCode
        size={300}
        imageUrl="https://walletconnect.com/_next/static/media/brand_icon_blue.c5e25f1c.svg"
        uri={uri}
      />
    </div>
  )
}
