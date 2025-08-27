// ChainMachine.ts (XState v5)
import { type DoneActorEvent, assign, fromPromise, setup } from 'xstate'

import type { CaipNetwork, CaipNetworkId, ChainNamespace } from '@reown/appkit-common'

import type { NamespaceState } from '../../utils/TypeUtil copy.js'

export type Ports = {
  persistActiveCaipNetworkId: (id: CaipNetworkId) => void
  setPublicState: (patch: {
    activeChain?: ChainNamespace
    selectedNetworkId?: CaipNetworkId
  }) => void
  filterConnectorsByNamespace: (ns: ChainNamespace, enabled: boolean) => void
  filterConnectorsByNamespaces: (namespaces: ChainNamespace[]) => void
  openUnsupportedChainUI: () => void
  resetSend: () => void
  trackSwitchNetwork: (caipNetworkId: CaipNetworkId) => void
  requestProviderSwitch: (args: {
    namespace: ChainNamespace
    chainId: number | string
  }) => Promise<void>
  loadActiveNetworkProps: () => { namespace?: ChainNamespace; caipNetworkId?: CaipNetworkId }
  getApprovedNetworksData: (args: {
    activeNamespace?: ChainNamespace
    activeNetwork?: CaipNetwork
  }) => Promise<{ supportsAllNetworks: boolean; approvedCaipNetworkIds: CaipNetworkId[] }>
  flags: {
    enableNetworkSwitch: boolean
    allowUnsupportedChain: boolean
    namesSupportedNamespaces: ChainNamespace[]
  }
}

export type ChainContext = {
  activeChain?: ChainNamespace
  activeCaipNetwork?: CaipNetwork
  isSwitchingNamespace: boolean
  lastConnectedSIWECaipNetwork?: CaipNetwork
  namespaces: Map<ChainNamespace, NamespaceState>
  smartAccountEnabledNetworks: CaipNetworkId[]
  bootstrapNetworks?: CaipNetwork[]
  ports: Ports
  lastError?: string
}

export type ChainEvent =
  | { type: 'INIT'; caipNetworks?: CaipNetwork[] }
  | { type: 'ADD_NETWORK'; network: CaipNetwork }
  | { type: 'REMOVE_NETWORK'; namespace: ChainNamespace; networkId: number | string }
  | { type: 'SET_ACTIVE_NAMESPACE'; namespace: ChainNamespace }
  | { type: 'SET_ACTIVE_NETWORK'; network: CaipNetwork }
  | { type: 'SWITCH_ACTIVE_NAMESPACE'; namespace: ChainNamespace }
  | { type: 'SWITCH_ACTIVE_NETWORK'; network: CaipNetwork }
  | { type: 'REFRESH_APPROVED_NETWORKS' }
  | { type: 'SET_REQUESTED_NETWORKS'; namespace: ChainNamespace; caipNetworks: CaipNetwork[] }
  | { type: 'SET_SMART_ACCOUNT_ENABLED'; namespace: ChainNamespace; networkIds: number[] }
  | { type: 'SET_LAST_SIWE_NETWORK'; network?: CaipNetwork }
  | { type: 'RESET_NETWORK'; namespace: ChainNamespace }
  | { type: 'SET_ERROR'; data?: string; message?: string }
  | { type: 'RESET_ERROR' }

// ---------- Helpers ----------
function sortRequested(
  approved: CaipNetworkId[] = [],
  requested: CaipNetwork[] = []
): CaipNetwork[] {
  if (!approved.length) {
    return requested.slice()
  }
  const approvedSet = new Set(approved)
  const approvedFirst = requested.filter(n => approvedSet.has(n.caipNetworkId))
  const rest = requested.filter(n => !approvedSet.has(n.caipNetworkId))

  return [...approvedFirst, ...rest]
}
function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

type ActionArgs = { context: ChainContext; event: ChainEvent }

// ---------- Guards (plain fns) ----------
function isSameNamespace({
  context,
  event
}: {
  context: ChainContext
  event: ChainEvent
}): boolean {
  return event.type === 'SWITCH_ACTIVE_NAMESPACE' && event.namespace === context.activeChain
}

function providerSupportsTarget({
  context,
  event
}: {
  context: ChainContext
  event: ChainEvent
}): boolean {
  if (event.type !== 'SWITCH_ACTIVE_NETWORK') {
    return false
  }
  const s = context.namespaces.get(event.network.chainNamespace)
  if (!s) {
    return false
  }

  return (
    Boolean(s.supportsAllNetworks) ||
    s.approvedCaipNetworkIds?.includes(event.network.caipNetworkId) === true
  )
}

function appAllowsUnsupported({
  context,
  event
}: {
  context: ChainContext
  event: ChainEvent
}): boolean {
  if (event.type !== 'SWITCH_ACTIVE_NETWORK') {
    return false
  }
  const { flags } = context.ports
  if (!flags.enableNetworkSwitch) {
    return false
  }
  if (flags.allowUnsupportedChain) {
    return true
  }
  const s = context.namespaces.get(event.network.chainNamespace)

  return Boolean(s?.requestedCaipNetworks?.find(n => n.id === event.network.id))
}

// ---------- Actors (services) ----------
const svcBootstrap = fromPromise(async ({ input }) => {
  const ctx = input as ChainContext
  const namespaces = new Map<ChainNamespace, NamespaceState>()
  const caipNetworks = ctx.bootstrapNetworks ?? []
  const allNamespaces = new Set(caipNetworks.map(n => n.chainNamespace))

  for (const ns of allNamespaces) {
    const requested = caipNetworks.filter(n => n.chainNamespace === ns)
    namespaces.set(ns, {
      requestedCaipNetworks: requested,
      approvedCaipNetworkIds: [],
      activeCaipNetwork: requested[0]
    })
  }

  // Optionally pre-apply approved networks at boot:
  const approved = await ctx.ports
    .getApprovedNetworksData({
      activeNamespace: ctx.activeChain,
      activeNetwork: ctx.activeCaipNetwork
    })
    .catch(() => ({ supportsAllNetworks: true, approvedCaipNetworkIds: [] as CaipNetworkId[] }))

  for (const [ns, s] of namespaces) {
    const sorted = sortRequested(approved.approvedCaipNetworkIds, s.requestedCaipNetworks)
    namespaces.set(ns, {
      ...s,
      supportsAllNetworks: approved.supportsAllNetworks,
      approvedCaipNetworkIds: approved.approvedCaipNetworkIds,
      requestedCaipNetworks: sorted,
      activeCaipNetwork: s.activeCaipNetwork ?? sorted[0]
    })
  }

  return { namespaces }
})

const svcRefreshApproved = fromPromise(async ({ input }) => {
  const ctx = input as ChainContext
  const approved = await ctx.ports
    .getApprovedNetworksData({
      activeNamespace: ctx.activeChain,
      activeNetwork: ctx.activeCaipNetwork
    })
    .catch(() => ({ supportsAllNetworks: true, approvedCaipNetworkIds: [] as CaipNetworkId[] }))

  const namespaces = new Map(ctx.namespaces)
  for (const [ns, s] of namespaces) {
    const sorted = sortRequested(approved.approvedCaipNetworkIds, s.requestedCaipNetworks)
    namespaces.set(ns, {
      ...s,
      supportsAllNetworks: approved.supportsAllNetworks,
      approvedCaipNetworkIds: approved.approvedCaipNetworkIds,
      requestedCaipNetworks: sorted,
      activeCaipNetwork: s.activeCaipNetwork ?? sorted[0]
    })
  }

  return { namespaces }
})

const svcRequestProviderSwitch = fromPromise(async ({ input }) => {
  const { context, event } = input as { context: ChainContext; event: ChainEvent }
  if (event.type !== 'SWITCH_ACTIVE_NETWORK') {
    return
  }
  const t = event.network
  await context.ports.requestProviderSwitch({ namespace: t.chainNamespace, chainId: t.id })

  // Side-effects after successful switch
  context.ports.resetSend()
  context.ports.persistActiveCaipNetworkId(t.caipNetworkId)
  context.ports.setPublicState({
    activeChain: t.chainNamespace,
    selectedNetworkId: t.caipNetworkId
  })
  context.ports.trackSwitchNetwork(t.caipNetworkId)
})

// ---------- Actions (named) ----------
function showUnsupported({ context }: { context: ChainContext }) {
  context.ports.openUnsupportedChainUI()
}

function refilterConnectorNamespaces({ context }: { context: ChainContext }) {
  const allRequested = Array.from(context.namespaces.values()).flatMap(
    s => s.requestedCaipNetworks ?? []
  )
  const namespaces = unique(allRequested.map(n => n.chainNamespace))
  context.ports.filterConnectorsByNamespaces(namespaces)
}

// ---------- Machine ----------
export const chainMachine = setup({
  types: {
    context: {} as ChainContext,
    events: {} as ChainEvent
  },
  guards: {
    isSameNamespace,
    providerSupportsTarget,
    appAllowsUnsupported
  },
  actors: {
    svcBootstrap,
    svcRefreshApproved,
    svcRequestProviderSwitch
  }
}).createMachine({
  id: 'chain-controller',
  context: ({ input }) => input as ChainContext,
  initial: 'idle',
  states: {
    idle: {
      on: { INIT: 'bootstrapping' }
    },

    bootstrapping: {
      invoke: {
        src: 'svcBootstrap',
        input: ({ context }) => context,
        onDone: {
          target: 'ready',
          actions: [
            assign({
              namespaces: ({ event, context }) => {
                if (event.type !== 'xstate.done.actor.svcBootstrap') {
                  return context.namespaces
                }

                return (
                  event as DoneActorEvent<
                    { namespaces: Map<ChainNamespace, NamespaceState> },
                    string
                  >
                ).output.namespaces
              }
            }),
            assign(({ context, event }) => {
              if (event.type !== 'xstate.done.actor.svcBootstrap') {
                return {}
              }
              const ctx = context as ChainContext
              const { namespace, caipNetworkId } = ctx.ports.loadActiveNetworkProps()
              let activeCaipNetwork: CaipNetwork | undefined = undefined
              if (caipNetworkId) {
                for (const [, s] of ctx.namespaces) {
                  const found = (s.requestedCaipNetworks ?? []).find(
                    (n: CaipNetwork) => n.caipNetworkId === caipNetworkId
                  )
                  if (found) {
                    activeCaipNetwork = found
                    break
                  }
                }
              }

              return { activeChain: namespace, activeCaipNetwork }
            })
          ]
        },
        onError: {
          target: 'error',
          actions: assign({ lastError: ({ event }) => String((event as { error: unknown }).error) })
        }
      }
    },

    ready: {
      on: {
        ADD_NETWORK: {
          actions: assign(({ context, event }: ActionArgs) => {
            if (event.type !== 'ADD_NETWORK') {
              return {}
            }
            const ns = event.network.chainNamespace
            const prev = context.namespaces.get(ns) || {
              requestedCaipNetworks: [],
              approvedCaipNetworkIds: [] as CaipNetworkId[]
            }
            if (
              !(prev.requestedCaipNetworks ?? []).find(
                (n: CaipNetwork) => n.id === event.network.id
              )
            ) {
              const next = {
                ...prev,
                requestedCaipNetworks: [...(prev.requestedCaipNetworks ?? []), event.network]
              }
              const map = new Map(context.namespaces)
              map.set(ns, next)
              context.ports.filterConnectorsByNamespace(ns, true)

              return { namespaces: map }
            }

            return {}
          })
        },
        REMOVE_NETWORK: {
          actions: assign(({ context, event }: ActionArgs) => {
            if (event.type !== 'REMOVE_NETWORK') {
              return {}
            }
            const prev = context.namespaces.get(event.namespace)
            if (!prev) {
              return {}
            }
            const nextList = (prev.requestedCaipNetworks ?? []).filter(
              (n: CaipNetwork) => n.id !== event.networkId
            )
            const next: NamespaceState = { ...prev, requestedCaipNetworks: nextList }
            const map = new Map(context.namespaces)
            map.set(event.namespace, next)
            if (nextList.length === 0) {
              context.ports.filterConnectorsByNamespace(event.namespace, false)
            }

            return { namespaces: map }
          })
        },

        SET_ACTIVE_NAMESPACE: {
          actions: assign(({ context, event }: ActionArgs) => {
            if (event.type !== 'SET_ACTIVE_NAMESPACE') {
              return {}
            }
            const s = context.namespaces.get(event.namespace)

            return {
              activeChain: event.namespace,
              activeCaipNetwork: s?.activeCaipNetwork ?? s?.requestedCaipNetworks?.[0]
            }
          })
        },
        SET_ACTIVE_NETWORK: {
          actions: assign(({ event }: ActionArgs) => {
            if (event.type !== 'SET_ACTIVE_NETWORK') {
              return {}
            }

            return { activeChain: event.network.chainNamespace, activeCaipNetwork: event.network }
          })
        },

        SWITCH_ACTIVE_NAMESPACE: [
          { guard: { type: 'isSameNamespace' } },
          { target: 'switchingNamespace' }
        ],
        SWITCH_ACTIVE_NETWORK: [
          { guard: { type: 'providerSupportsTarget' }, target: 'switchingNetwork' },
          { guard: { type: 'appAllowsUnsupported' }, target: 'switchingNetwork' },
          // Remain in 'ready'
          { actions: showUnsupported }
        ],

        REFRESH_APPROVED_NETWORKS: { target: 'refreshingApproved' },

        SET_REQUESTED_NETWORKS: {
          actions: [
            assign(({ context, event }: ActionArgs) => {
              if (event.type !== 'SET_REQUESTED_NETWORKS') {
                return {}
              }
              const prev = context.namespaces.get(event.namespace) || {
                requestedCaipNetworks: [],
                approvedCaipNetworkIds: [] as CaipNetworkId[]
              }
              const sorted = sortRequested(prev.approvedCaipNetworkIds, event.caipNetworks)
              const next: NamespaceState = {
                ...prev,
                requestedCaipNetworks: sorted,
                activeCaipNetwork: prev.activeCaipNetwork ?? sorted[0]
              }
              const map = new Map(context.namespaces)
              map.set(event.namespace, next)

              return { namespaces: map }
            }),
            refilterConnectorNamespaces
          ]
        },

        SET_SMART_ACCOUNT_ENABLED: {
          actions: assign(({ event }: ActionArgs) => {
            if (event.type !== 'SET_SMART_ACCOUNT_ENABLED') {
              return {}
            }

            return {
              smartAccountEnabledNetworks: event.networkIds.map(
                (id: number) => `${event.namespace}:${id}` as CaipNetworkId
              )
            }
          })
        },

        SET_LAST_SIWE_NETWORK: {
          actions: assign(({ event, context }: ActionArgs) => ({
            lastConnectedSIWECaipNetwork:
              event.type === 'SET_LAST_SIWE_NETWORK'
                ? event.network
                : context.lastConnectedSIWECaipNetwork
          }))
        },

        RESET_NETWORK: {
          actions: assign(({ context, event }: ActionArgs) => {
            if (event.type !== 'RESET_NETWORK') {
              return {}
            }
            const map = new Map(context.namespaces)
            map.set(event.namespace, {
              activeCaipNetwork: undefined,
              requestedCaipNetworks: [],
              approvedCaipNetworkIds: []
            })

            return { namespaces: map }
          })
        },

        RESET_ERROR: { actions: assign({ lastError: () => undefined }) }
      }
    },

    switchingNamespace: {
      entry: assign({ isSwitchingNamespace: () => true }),
      always: {
        target: 'ready',
        actions: [
          assign(({ context, event }: ActionArgs) => {
            if (event.type !== 'SWITCH_ACTIVE_NAMESPACE') {
              return {}
            }
            const s = context.namespaces.get(event.namespace)
            const first = s?.requestedCaipNetworks?.[0]
            if (!first) {
              throw new Error('No networks found for namespace')
            }

            return { activeChain: event.namespace, activeCaipNetwork: first }
          }),
          assign({ isSwitchingNamespace: false })
        ]
      }
    },

    switchingNetwork: {
      invoke: {
        src: 'svcRequestProviderSwitch',
        input: ({ context, event }) => ({ context, event }),
        onDone: {
          target: 'ready',
          actions: assign(({ event }) => {
            if (event.type !== 'xstate.done.actor.svcRequestProviderSwitch') {
              return {}
            }

            const { network } = (event as DoneActorEvent<{ network: CaipNetwork }, string>).output

            return {
              activeChain: network.chainNamespace,
              activeCaipNetwork: network
            }
          })
        },
        onError: {
          target: 'error',
          actions: assign({ lastError: ({ event }) => String((event as { error: unknown }).error) })
        }
      }
    },

    refreshingApproved: {
      invoke: {
        src: 'svcRefreshApproved',
        input: ({ context }) => context,
        onDone: {
          target: 'ready',
          actions: assign(({ event }) => ({
            namespaces: (event as { output: { namespaces: Map<ChainNamespace, NamespaceState> } })
              .output.namespaces
          }))
        },
        onError: {
          target: 'error',
          actions: assign({ lastError: ({ event }) => String((event as { error: unknown }).error) })
        }
      }
    },

    error: {
      on: { RESET_ERROR: { target: 'ready', actions: assign({ lastError: () => undefined }) } }
    }
  }
})
