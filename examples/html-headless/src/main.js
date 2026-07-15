import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, polygon } from '@reown/appkit/networks'

// Public projectId for localhost only — create your own at https://dashboard.reown.com
const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'
const networks = [mainnet, polygon]

const wagmiAdapter = new WagmiAdapter({ networks, projectId })

// Headless: no AppKit modal — this app renders its own wallet list and connects
// programmatically through the imperative client API.
const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  features: { headless: true },
  metadata: {
    name: 'AppKit Headless HTML',
    description: 'Headless wallet list driven by the imperative AppKit client API',
    url: window.location.origin,
    icons: []
  }
})

// -- DOM --------------------------------------------------------------------- //
const openBtn = document.getElementById('open')
const modal = document.getElementById('modal')
const listEl = document.getElementById('wallet-list')
const statusEl = document.getElementById('list-status')
const accountEl = document.getElementById('account')
const accountAddressEl = document.getElementById('account-address')
const disconnectBtn = document.getElementById('disconnect')

// -- Wallet list (infinite loading) ----------------------------------------- //
let page = 0
let loading = false

/** Whether more pages are available (the explorer reports a higher total than loaded). */
function hasMore() {
  const { wcWallets, count } = appKit.getWalletList()

  return wcWallets.length < count
}

/** Fetch the next page of WalletConnect wallets (appends to the list). */
async function loadMore() {
  if (loading || (page > 0 && !hasMore())) {
    return
  }
  loading = true
  statusEl.textContent = 'Loading…'
  try {
    page += 1
    await appKit.fetchWallets({ page }) // ← imperative client API; appends to the list
  } catch (error) {
    statusEl.textContent = 'Failed to load wallets.'
    // eslint-disable-next-line no-console
    console.error(error)
  } finally {
    loading = false
  }
}

/** Render the current wallet list (called on every wallet-list change). */
function renderWallets() {
  const { wcWallets, count } = appKit.getWalletList() // ← imperative client API
  listEl.replaceChildren(
    ...wcWallets.map(wallet => {
      const item = document.createElement('button')
      item.className = 'wallet'
      item.innerHTML = `
        <img class="wallet__icon" src="${wallet.imageUrl ?? ''}" alt="" />
        <span class="wallet__name">${wallet.name}</span>`
      item.addEventListener('click', () => connect(wallet))

      return item
    })
  )
  statusEl.textContent = wcWallets.length
    ? `${wcWallets.length} of ${count} wallets`
    : 'No wallets yet'
}

// Re-render whenever the wallet list / search / pagination state changes.
appKit.subscribeWalletList(renderWallets) // ← imperative client API

// Infinite scroll: load the next page as the user nears the bottom.
listEl.addEventListener('scroll', () => {
  if (listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 120 && hasMore()) {
    void loadMore()
  }
})

// -- Connect ----------------------------------------------------------------- //
async function connect(wallet) {
  statusEl.textContent = `Connecting ${wallet.name}…`
  try {
    await appKit.connectWallet(wallet, 'eip155') // ← imperative client API
  } catch (error) {
    statusEl.textContent = `Failed to connect ${wallet.name}.`
    // eslint-disable-next-line no-console
    console.error(error)
  }
}

// -- Account state ----------------------------------------------------------- //
function renderAccount() {
  const account = appKit.getAccount('eip155')
  const connected = Boolean(account?.address)
  accountEl.hidden = !connected
  openBtn.hidden = connected
  if (connected) {
    const a = account.address
    accountAddressEl.textContent = `${a.slice(0, 6)}…${a.slice(-4)}`
    closeModal()
  }
}

appKit.subscribeAccount(renderAccount, 'eip155')
disconnectBtn.addEventListener('click', () => appKit.disconnect('eip155'))

// -- Modal open/close -------------------------------------------------------- //
function openModal() {
  modal.hidden = false
  if (page === 0) {
    void loadMore() // first page on first open
  }
}

function closeModal() {
  modal.hidden = true
}

openBtn.addEventListener('click', openModal)
modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal))

// Initial paint.
renderAccount()
renderWallets()
