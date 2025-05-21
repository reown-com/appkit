'use client'

export default function WagmiSafeIframePage() {
  return (
    <div>
      <h1>Wagmi Safe within an Iframe</h1>
      <iframe
        src="/library/wagmi-safe"
        title="Wagmi Safe Content"
        style={{ width: '100%', height: '800px', border: 'none' }}
      />
    </div>
  )
} 