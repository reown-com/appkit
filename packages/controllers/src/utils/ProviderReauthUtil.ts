import type { ChainNamespace } from '@reown/appkit-common'

import { ChainController } from '../controllers/ChainController.js'

/**
 * Recovers a provider whose wallet session was restored WITHOUT re-authorizing
 * the underlying SDK — the Coinbase Wallet SDK case.
 *
 * On an AppKit auto-restore, the Coinbase provider is read back via
 * `eth_accounts` only; `eth_requestAccounts` is never re-issued (unlike wagmi's
 * own `reconnect`, which calls the connector's `connect()` →
 * `eth_requestAccounts`). The Coinbase SDK keeps the accounts but drops its
 * internal authorization, so the first signing RPC on the raw provider throws
 * EIP-1193 `4100` ("Must call 'eth_requestAccounts' before other methods").
 * Consumers that call `.request()` directly on the provider (e.g. WalletConnect
 * Pay) hit this; consumers going through wagmi's hooks do not, because wagmi
 * re-authorized first.
 *
 * The recovery is adapter-agnostic: it wraps the one shared Coinbase provider
 * instance that every consumer reads, so both the wagmi and ethers adapters are
 * covered, and downstream code keeps no workaround of its own.
 */

/** Marks a provider already wrapped by {@link withCoinbaseReauth}. */
const REAUTH_WRAPPED = Symbol('appkit.coinbaseReauthWrapped')

/** Maximum `cause`-chain depth walked by {@link isUnauthorizedProviderError}. */
const MAX_CAUSE_DEPTH = 5

interface RequestArgs {
  method: string
  params?: unknown
}

interface Eip1193LikeProvider {
  request(args: RequestArgs): Promise<unknown>
}

/** Stable-identity cache: one wrapper per raw provider instance. */
const wrapperCache = new WeakMap<object, object>()

/**
 * True when `connectorId` is a Coinbase connector.
 *
 * The connector id (not the provider "type") is the reliable signal: it is a
 * stable `'coinbaseWallet'` / `'coinbaseWalletSDK'` across every adapter and
 * registration path, whereas the provider type is remapped to `'EXTERNAL'` by
 * `PresetsUtil.ConnectorTypesMap` on most paths. Matched case-insensitively by
 * substring to also tolerate the wagmi restore path's uppercased
 * `connector.type` (`'COINBASEWALLET'`).
 */
export function isCoinbaseConnectorId(connectorId: string | undefined): boolean {
  return typeof connectorId === 'string' && connectorId.toLowerCase().includes('coinbase')
}

/**
 * EIP-1193 `4100` unauthorized error, matched by code or by the SDK's
 * `eth_requestAccounts` wording, walking the `cause` chain (viem/provider
 * wrappers nest the original error) with bounded depth.
 */
export function isUnauthorizedProviderError(err: unknown, depth = 0): boolean {
  if (!err || typeof err !== 'object' || depth > MAX_CAUSE_DEPTH) {
    return false
  }

  const candidate = err as { code?: unknown; message?: unknown; cause?: unknown }

  if (candidate.code === 4100) {
    return true
  }

  if (typeof candidate.message === 'string' && candidate.message.includes('eth_requestAccounts')) {
    return true
  }

  if (candidate.cause && candidate.cause !== err) {
    return isUnauthorizedProviderError(candidate.cause, depth + 1)
  }

  return false
}

/**
 * Re-assert the app's active eip155 chain on the provider. `eth_requestAccounts`
 * can reset the Coinbase SDK's active chain (it tends to land back on mainnet),
 * so an `eth_sendTransaction` retry must re-pin the chain first — otherwise the
 * transaction could broadcast on the wrong network. Failure to switch is
 * propagated: better to fail the signing than to send funds on the wrong chain.
 */
async function reassertActiveChain(provider: Eip1193LikeProvider): Promise<void> {
  const chainId = ChainController.getActiveCaipNetwork('eip155')?.id

  if (typeof chainId !== 'number') {
    return
  }

  await provider.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: `0x${chainId.toString(16)}` }]
  })
}

/**
 * Wrap a Coinbase provider so any signing RPC that fails with `4100` triggers a
 * one-shot recovery: a single `eth_requestAccounts` re-authorization, an active-
 * chain re-assert for state-changing calls, then exactly one retry.
 *
 * - Non-`4100` failures pass through untouched (no re-auth attempt).
 * - A rejected re-auth prompt propagates and classifies as a user rejection.
 * - A still-unauthorized retry fails once (no loop) — the recovery calls the raw
 *   provider, never the wrapper, so it cannot recurse.
 *
 * Non-`request` members are delegated to the raw provider bound to the raw
 * instance, so private class fields and EIP-1193 event emitters keep working.
 * The wrapper is cached per raw instance so repeated `setProvider` calls with
 * the same provider return a stable reference (no consumer identity churn).
 */
export function withCoinbaseReauth<T extends object>(provider: T): T {
  const raw = provider as unknown as Eip1193LikeProvider

  if (!provider || typeof raw.request !== 'function') {
    return provider
  }

  if ((provider as Record<PropertyKey, unknown>)[REAUTH_WRAPPED]) {
    return provider
  }

  const cached = wrapperCache.get(provider)
  if (cached) {
    return cached as T
  }

  async function request(args: RequestArgs): Promise<unknown> {
    try {
      return await raw.request(args)
    } catch (err) {
      if (!isUnauthorizedProviderError(err)) {
        throw err
      }

      // One handshake re-authorizes the same SDK provider instance.
      await raw.request({ method: 'eth_requestAccounts' })

      if (args.method === 'eth_sendTransaction') {
        await reassertActiveChain(raw)
      }

      return raw.request(args)
    }
  }

  const proxy = new Proxy(provider, {
    get(target, prop) {
      if (prop === REAUTH_WRAPPED) {
        return true
      }

      if (prop === 'request') {
        return request
      }

      const value = Reflect.get(target, prop, target)

      return typeof value === 'function' ? value.bind(target) : value
    }
  })

  wrapperCache.set(provider, proxy)

  return proxy
}

/**
 * Apply {@link withCoinbaseReauth} to an eip155 Coinbase provider, returning
 * every other provider untouched. This is the single decision the provider
 * registration seam (`syncProvider`) needs — keeping the guard here (keyed on
 * the reliable connector id) rather than in the state setter.
 */
export function maybeWrapCoinbaseProvider<T>(params: {
  connectorId: string | undefined
  chainNamespace: ChainNamespace | undefined
  provider: T
}): T {
  const { connectorId, chainNamespace, provider } = params

  const shouldWrap =
    chainNamespace === 'eip155' &&
    isCoinbaseConnectorId(connectorId) &&
    typeof provider === 'object' &&
    provider !== null

  return shouldWrap ? (withCoinbaseReauth(provider as object) as T) : provider
}
