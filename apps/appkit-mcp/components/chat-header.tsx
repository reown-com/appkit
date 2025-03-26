import Image from 'next/image'
import Link from 'next/link'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

import { cn, getTruncateString } from '@/lib/utils'

export default function ChatHeader() {
  const { open } = useAppKit()
  const { address } = useAppKitAccount()

  return (
    <header
      className={cn(
        'w-full flex  items-center mb-4',
        address ? 'justify-between' : 'justify-center'
      )}
    >
      <div>
        <Link href="https://reown.com" target="_blank" rel="noopener noreferrer">
          <Image src={'/reown-logo.png'} alt="Reown logo" width={150} height={40} />
        </Link>
      </div>
      {address ? (
        <div>
          <button
            className="w-auto bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={() => {
              open()
            }}
          >
            {address
              ? getTruncateString({
                  string: address,
                  charsStart: 6,
                  charsEnd: 5
                })
              : 'Connect'}
          </button>
        </div>
      ) : null}
    </header>
  )
}
