import type { WcWallet } from '@web3modal/core'
import { ConnectorController } from '@web3modal/core'

export function markWalletsAsInstalled(wallets: WcWallet[]) {
  const { connectors } = ConnectorController.state
  const installedConnectors = connectors
    .filter(c => c.type === 'ANNOUNCED')
    .reduce<Record<string, boolean>>((acum, val) => {
      if (!val.info?.rdns) {
        return acum
      }
      acum[val.info.rdns] = true

      return acum
    }, {})

  const walletsWithInstalled: (WcWallet & { installed: boolean })[] = wallets.map(wallet => ({
    ...wallet,
    installed: Boolean(wallet.rdns) && Boolean(installedConnectors[wallet.rdns ?? ''])
  }))

  const sortedWallets = walletsWithInstalled.sort(
    (a, b) => Number(b.installed) - Number(a.installed)
  )

  return sortedWallets
}
