import type { Metadata } from 'next'
import { AppKitProvider } from '@/providers/appkit-provider'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'AppKit Builder - WIP',
  description: 'Customize and test your AppKit app'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <link rel="preconnect" href="https://fonts.googleapis.com"></link>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"></link>
      <link
        href="https://fonts.googleapis.com/css2?family=Agbalumo&family=Delius&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        rel="stylesheet"
      />
      <Toaster />
      <AppKitProvider>
        <body>{children}</body>
      </AppKitProvider>
    </html>
  )
}
