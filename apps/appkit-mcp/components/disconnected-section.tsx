import Lottie from 'lottie-react'

import { useAppKitAccount } from '@reown/appkit-controllers/react'
import { useAppKit } from '@reown/appkit/react'

import { lottieAnimationData } from '@/app/constants/lottie'
import { getTruncateString } from '@/lib/utils'

export default function DisconnectedSection() {
  const { open } = useAppKit()
  const { address } = useAppKitAccount()

  return (
    <section className="w-[90%] px-6 fixed z-10 h-screen left-1/2 -translate-x-1/2 top-0 flex flex-col items-center justify-center">
      <div className="z-10 absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pr-5 pl-5 w-96">
        <Lottie animationData={lottieAnimationData} loop={true} />
      </div>

      <div className="marquee-header-titles backdrop-blur-sm bg-fg-primary/50 pt-48 lg:pt-24 relative z-20 flex flex-col gap-2 items-center mb-0 md:mb-12">
        <h4 className="text-5xl lg:text-6xl text-text-primary text-center mb-4">
          Chat Onchain with AppKit
        </h4>
        <p className="text-xl lg:text-3xl max-w-2xl text-text-secondary text-center mb-8">
          Get your transaction history, see balances, swap or send tokens - all onchain, powered by
          AppKit.
        </p>
        <p className="text-xl lg:text-2xl text-text-secondary text-center mb-2">
          Connect your wallet to get started.
        </p>
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
    </section>
  )
}
