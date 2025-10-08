import {
  BlockchainApiController,
  CoreHelperUtil,
  OptionsController
} from '@reown/appkit-controllers'

export function getTonConnectManifestUrl(): string {
  const base = `${CoreHelperUtil.getApiUrl()}/ton/v1/manifest`
  const { metadata, projectId } = OptionsController.state
  const { st, sv } = BlockchainApiController.getSdkProperties()

  const appUrl = metadata?.url || (typeof window !== 'undefined' ? window.location.origin : '')
  const name = metadata?.name || ''
  const iconUrl = metadata?.icons?.[0] || ''

  const u = new URL(base)
  u.searchParams.set('projectId', projectId)
  u.searchParams.set('st', st)
  u.searchParams.set('sv', sv)
  u.searchParams.set('url', appUrl)
  u.searchParams.set('name', name)
  u.searchParams.set('iconUrl', iconUrl)

  return 'https://appkit-laboratory-irtfq5uy0-reown-com.vercel.app/ton-manifest.json'
}
