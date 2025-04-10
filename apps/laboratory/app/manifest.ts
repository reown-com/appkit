import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AppKit Laboratory',
    short_name: 'AppKit Lab',
    description: 'Laboratory application for AppKit to test and develop features',
    background_color: '#ffffff',
    theme_color: '#000000',
    display: 'fullscreen',
    orientation: 'portrait',
    start_url: '/',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png'
      }
    ]
  }
}
