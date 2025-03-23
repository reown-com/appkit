import Image from 'next/image'

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
        <Image src={'/reown-logo.png'} alt="Reown logo" width={150} height={40} />
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
