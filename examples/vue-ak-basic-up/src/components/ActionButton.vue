<template>
  <div v-if="provider" class="appkit-buttons-container">
    <template v-if="session">
      <button @click="disconnect">Disconnect</button>
      <button @click="getBalance">Get Balance</button>
    </template>
    <button v-else @click="connect">Connect</button>
  </div>
</template>

<script setup lang="ts">
import type { UniversalProvider } from '@walletconnect/universal-provider'

interface Props {
  provider?: InstanceType<typeof UniversalProvider>
  session: unknown
  account?: string
  onSessionChange: (session: unknown) => void
  onBalanceChange: (balance: string | undefined) => void
  onAccountChange: (account: string | undefined) => void
  onNetworkChange: (network: string | undefined) => void
}

const props = defineProps<Props>()

const disconnect = async () => {
  if (!props.provider) return
  await props.provider.disconnect()
  props.onSessionChange(props.provider.session)
  props.onBalanceChange(undefined)
  props.onAccountChange(undefined)
  props.onNetworkChange(undefined)
}

const getBalance = async () => {
  if (!props.provider || !props.account) return
  const balance = await props.provider.request({
    method: 'eth_getBalance',
    params: [props.account, 'latest']
  })
  props.onBalanceChange(balance as string)
}

const connect = async () => {
  if (!props.provider) return
  await props.provider.connect({
    optionalNamespaces: {
      eip155: {
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData'
        ],
        chains: ['eip155:1'],
        events: ['chainChanged', 'accountsChanged']
      }
    }
  })
}
</script>
