/* eslint-disable no-console */
// ChainMachine.ts (XState v5)
import { type DoneActorEvent, assign, fromCallback, fromPromise, setup } from 'xstate'

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
    requestedCaipNetworks: CaipNetwork[]
  }) => { supportsAllNetworks: boolean; approvedCaipNetworks: CaipNetwork[] }
  flags: {
    enableNetworkSwitch: boolean
    allowUnsupportedChain: boolean
    namesSupportedNamespaces: ChainNamespace[]
  }
}

export type ChainContext = {
  activeChain?: ChainNamespace
  isSwitchingNamespace: boolean
  lastConnectedSIWECaipNetwork?: CaipNetwork
  namespaces: Map<ChainNamespace, NamespaceState>
  smartAccountEnabledNetworks: CaipNetworkId[]
  bootstrapNetworks?: CaipNetwork[]
  ports: Ports
  lastError?: string
}
export type ChainState =
  | 'idle'
  | 'ready'
  | 'switchingNamespace'
  | 'switchingNetwork'
  | 'refreshingApproved'
  | 'error'

export type ChainEvent =
  | { type: 'INIT'; caipNetworks?: CaipNetwork[] }
  | { type: 'ADD_NETWORK'; network: CaipNetwork }
  | { type: 'REMOVE_NETWORK'; namespace: ChainNamespace; networkId: number | string }
  | { type: 'SWITCH_ACTIVE_NAMESPACE'; namespace: ChainNamespace }
  | { type: 'SWITCH_ACTIVE_NETWORK'; network: CaipNetwork }
  | { type: 'REFRESH_APPROVED_NETWORKS' }
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

type ActionArgs = { context: ChainContext; event: ChainEvent }

// ---------- Guards (plain fns) ----------
function isDifferentNamespace({
  context,
  event
}: {
  context: ChainContext
  event: ChainEvent
}): boolean {
  return event.type === 'SWITCH_ACTIVE_NAMESPACE' && event.namespace !== context.activeChain
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
    Boolean(s.approvedCaipNetworks?.some(n => n.caipNetworkId === event.network.caipNetworkId))
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
const svcRefreshApproved = fromCallback(args => {
  const input = args.input as ChainContext

  if (!input.activeChain) {
    return
  }

  const { ports, activeChain } = input

  const approved = ports.getApprovedNetworksData({
    activeNamespace: activeChain,
    activeNetwork: input.namespaces.get(activeChain)?.activeCaipNetwork,
    requestedCaipNetworks: input.namespaces.get(activeChain)?.requestedCaipNetworks ?? []
  })

  const namespaces = new Map(input.namespaces)
  for (const [ns, s] of namespaces) {
    const sorted = sortRequested(
      approved.approvedCaipNetworks.map(n => n.caipNetworkId),
      s.requestedCaipNetworks
    )
    namespaces.set(ns, {
      ...s,
      supportsAllNetworks: approved.supportsAllNetworks,
      approvedCaipNetworks: approved.approvedCaipNetworks,
      requestedCaipNetworks: sorted
    })
  }

  args.sendBack({ type: 'xstate.done.actor.svcRefreshApproved', output: { namespaces } })
})

const svcRequestProviderSwitch = fromPromise(async ({ input }) => {
  const { context, event } = input as { context: ChainContext; event: ChainEvent }
  if (event.type !== 'SWITCH_ACTIVE_NETWORK') {
    return { network: undefined, approved: undefined }
  }

  const t = event.network

  // Ask provider/wallet to switch
  await context.ports.requestProviderSwitch({ namespace: t.chainNamespace, chainId: t.id })
  // Side-effects after successful switch
  context.ports.resetSend()
  context.ports.persistActiveCaipNetworkId(t.caipNetworkId)
  context.ports.setPublicState({
    activeChain: t.chainNamespace,
    selectedNetworkId: t.caipNetworkId
  })
  context.ports.trackSwitchNetwork(t.caipNetworkId)

  // Fetch approved networks (async) HERE, not in assign
  const approved = context.ports.getApprovedNetworksData({
    activeNamespace: t.chainNamespace,
    activeNetwork: t,
    requestedCaipNetworks: context.namespaces.get(t.chainNamespace)?.requestedCaipNetworks ?? []
  })

  console.log('>> HELLO??', {
    activeNamespace: t.chainNamespace,
    approved,
    activeNetwork: t,
    requestedCaipNetworks: context.namespaces.get(t.chainNamespace)?.requestedCaipNetworks ?? []
  })

  return { network: t, approved }
})

// ---------- Machine ----------
export const chainMachine = setup({
  types: {
    context: {} as ChainContext,
    events: {} as ChainEvent
  },
  guards: {
    isDifferentNamespace,
    providerSupportsTarget,
    appAllowsUnsupported
  },
  actors: {
    svcRefreshApproved,
    svcRequestProviderSwitch
  }
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGMAWBDAlgOwLTIHtsAXAJwIBsKxSA6TCagYgEkA5FgFQG0AGAXUSgADgViZimIkJAAPRAGZeAJloAWZQDZtARh2aAnEZ0KArABoQAT0Q6AHAHZap3rwN7ND00oPKFAX39LNCw8QhJyKhpaUjB0CCsmAEEAERSAfTYAUU4AdQB5ACUAaT5BJBBRcUlpCvkETWVeZwVDQ287Vr1LGwQdNVNVXgcDBwdeHVNvbUDgjBx8IjJKajpY+MTCrIBZfIA1LMycgpKymSqJKWwZeoUDO2dTO0aHNU07J9MxntsBoZHtGoFA5lAZGqZZiAQgtwssoms4gkmABlXJcADCAAl0kl0ZwWAdMkltllkQAFXFZM4VC41a51RCdZoKJpfZRNe6aHQOH4IN5qWgOHT3YzCyZctSQ6FhJaRVYxRGJVEY7G4-GEtjE0kU9FUnTlERiS61UD1D6aWi8Z4mQaaXguOxqXkOTQCl3KZ5uBTPF0GKXzGURFbRdZI5WcLE4vEEw7ZPJFUoCc5Guk3RAGXgKQX6Mxve3cuw6Xk6JpZ9xaN4KSYlkH+0KLIPwhUbFFoiOq6Ma44J7j65PVK5phAZrPs14e0btEbF-oWllqPQlhRqIG+Osw2XBhEtrYAMS2yNVZLJhX2WQycZOxWR1MNA5NckQuEmtA9vFdVd4A3ePt5C9MtCjC6mgKKBygLgM66BnC8qhkqOTpMi2xJIUnBRui+QAKpsGhWSagAQgAMuet6VCmg4MggXxOCYVYgWoYIsmYvLPn4tB3OBC6MRME5QQ2MEhoqKIIYRSTImhyIsLksbdqcSY0uRD71HoXy0O8YwGK0wJPAMLFLuxvgrsKIE8c8fGwnKgk7qSCGXj28l3sa9KmumYK0HYHrKNyJgfF8elsRxAyZncXKGA45mbk2cFMAeCFZIUp6FKRtIUS5CCeuxpgZmodiaZm2gWNYT76YFXEmSWZlBFCAb8ZZdCwAA7hIaA4FAbDoAAtnAwjoMgYBMMlinOY+fQejotA5uyBhPK8X48kV6ULhN3g5W8XhaZoEWNvKjXNagrVsGAxANQQpAANZMBARBgPQ2AAG4EGdN3SrVW60LtxAtdgbVHSd50IDgD3IOgdJlIN97DcpGYAcopj9CMC5eV5mi8p4qgOEoOjDGCcNgjoW0CfVTWfft32Hcdp0XTQ5B0MIFAgwAZqdHW0C9FlvR9X0-RT-2AwQwOgwI4NOUO9i5a+oLI3Ymaw8MM6aABVrzvouVKFaBN1QqDOxLApNQEkwjCOQd2QJd123Q9T2szV7NRWA2twHrBtGwQJsQAD938yDVxgw5ZEQ0OoHLRjX4K4x7rOnaloY7mGlWm8GtvbEDu661zvG6b1OnbQdOM8z1v1rbsH2zrTuGxn7t8wLPtC37KVKYoWYeYMQoeXcLJFgtjoPKYrrgeyGgecoidNlnpAxTZuEJUUwuppRXk5exWOaUKRiONyf4eq+ha2hm00dIEVXYAQEBwDIbORas-Yi5RuAgdv75Alj352I4LFec0uXgVyrgOJ0niSiqhfba0QGDUGvnPNK3Jmgli8k8ZcjR+hTF5B-dQYw1CuEaAuR03oR7Fw2BA1KI07jNC0L3cCuU4YLk7r0YEDxHBcl7hgrkZgzB4OiJzPW7UuqwB6n1QhDc+iugtB5FQK5pb70zM6JQgFX4ug6AYDQmZ2FEz2gdX6lMBGQ1sHaAUy83xeHtOMZQM43jR3gVMYUDEcoqK1qXNO5dXaQC0UOXAzQW7TSaCWXukxHQowWr3UhpgcrBI-jpYeQCbaX2iGPFx89uSqCmCuYRrQcrvmLO+VQ9g7SsI0EoCJgQgA */
  id: 'chain-controller',
  context: ({ input }) => input as ChainContext,
  initial: 'idle',
  states: {
    idle: {
      on: {
        INIT: {
          target: 'ready',
          actions: assign(({ context, event }) => {
            const storage = context.ports.loadActiveNetworkProps()
            console.log('>> INIT - loaded from storage', { storage })
            const storageActiveNetwork = storage.caipNetworkId
            const activeCaipNetwork = event.caipNetworks?.find(
              network => network.caipNetworkId === storageActiveNetwork
            )

            const namespaces = new Set([
              ...(event.caipNetworks?.map(network => network.chainNamespace) ?? [])
            ])
            const namespaceMap = new Map<ChainNamespace, NamespaceState>()
            namespaces.forEach(ns => {
              const namespaceNetworks = event.caipNetworks?.filter(
                network => network.chainNamespace === ns
              )

              namespaceMap.set(ns, {
                activeCaipNetwork: namespaceNetworks?.[0],
                requestedCaipNetworks: namespaceNetworks ?? [],
                approvedCaipNetworks: [],
                supportsAllNetworks: true
              })
            })

            console.log('>> INIT - done', {
              namespaceMap,
              activeCaipNetwork,
              activeChain: storage.namespace
            })

            return {
              activeChain: storage.namespace,
              activeCaipNetwork,
              namespaces: namespaceMap
            }
          })
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

        SWITCH_ACTIVE_NAMESPACE: [
          { guard: { type: 'isDifferentNamespace' } },
          { target: 'switchingNamespace' }
        ],
        SWITCH_ACTIVE_NETWORK: [
          { guard: { type: 'providerSupportsTarget' }, target: 'switchingNetwork' },
          { guard: { type: 'appAllowsUnsupported' }, target: 'switchingNetwork' }
        ],

        REFRESH_APPROVED_NETWORKS: { target: 'refreshingApproved' },

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
              approvedCaipNetworks: []
            })

            return { namespaces: map }
          })
        },

        RESET_ERROR: { actions: assign({ lastError: () => undefined }) }
      }
    },

    switchingNamespace: {
      entry: assign({ isSwitchingNamespace: true }),
      exit: assign({ isSwitchingNamespace: false }),
      always: {
        target: 'ready',
        actions: [
          assign(({ context, event }: ActionArgs) => {
            if (event.type !== 'SWITCH_ACTIVE_NAMESPACE') {
              return {}
            }
            const namespaceState = context.namespaces.get(event.namespace)
            const activeCaipNetwork = namespaceState?.activeCaipNetwork
            const activeNetwork = activeCaipNetwork ?? namespaceState?.requestedCaipNetworks?.[0]
            if (!activeNetwork) {
              throw new Error('No networks found for namespace')
            }

            return {
              activeChain: event.namespace,
              namespaces: new Map(context.namespaces).set(event.namespace, {
                ...namespaceState,
                activeCaipNetwork: activeNetwork
              })
            }
          })
        ]
      }
    },

    switchingNetwork: {
      invoke: {
        src: 'svcRequestProviderSwitch',
        input: ({ context, event }) => ({ context, event }),
        onDone: {
          target: 'ready',
          actions: assign(({ context, event }) => {
            const { network, approved } = (
              event as DoneActorEvent<{
                network: CaipNetwork
                approved: { supportsAllNetworks: boolean; approvedCaipNetworks: CaipNetwork[] }
              }>
            ).output
            if (!network || !approved) {
              return {}
            }

            const namespace = network.chainNamespace
            const namespaceState = context.namespaces.get(namespace)
            const requested = namespaceState?.requestedCaipNetworks ?? []

            const namespaces = new Map(context.namespaces)
            namespaces.set(namespace, {
              ...namespaceState,
              activeCaipNetwork: network,
              supportsAllNetworks: approved.supportsAllNetworks,
              approvedCaipNetworks: approved.approvedCaipNetworks,
              requestedCaipNetworks: requested
            })

            return {
              activeChain: namespace,
              namespaces
            }
          })
        }
      }
    },

    refreshingApproved: {
      invoke: {
        src: 'svcRefreshApproved',
        input: ({ context }) => context,
        onDone: {
          target: 'ready',
          actions: assign(({ event, context }) => ({
            namespaces:
              (
                event as DoneActorEvent<
                  { namespaces: Map<ChainNamespace, NamespaceState> } | undefined
                >
              ).output?.namespaces ?? context.namespaces
          }))
        }
      }
    },

    error: {
      on: { RESET_ERROR: { target: 'ready', actions: assign({ lastError: () => undefined }) } }
    }
  }
})
