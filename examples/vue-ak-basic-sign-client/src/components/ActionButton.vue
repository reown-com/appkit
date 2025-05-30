<template>
  <div v-if="signClient" class="appkit-buttons-container">
    <template v-if="session">
      <button @click="disconnect">Disconnect</button>
      <button @click="signMessage">Sign Message</button>
    </template>
    <button v-else @click="connect">Connect</button>
  </div>
</template>

<script setup lang="ts">
import type { SignClient } from '@walletconnect/sign-client'
import type { SessionTypes } from '@walletconnect/types'

import { initializeModal } from '../config'

interface Props {
  signClient?: InstanceType<typeof SignClient>
  session: SessionTypes.Struct | undefined
  account?: string
  onSessionChange: (session: SessionTypes.Struct | undefined) => void
  onAccountChange: (account: string | undefined) => void
  onNetworkChange: (network: string | undefined) => void
}

const props = defineProps<Props>()

const disconnect = async () => {
  if (!props.signClient || !props.session) return
  await props.signClient.disconnect({
    topic: props.session.topic,
    reason: {
      code: 1000,
      message: 'User disconnected'
    }
  })
  props.onSessionChange(undefined)
  props.onAccountChange(undefined)
  props.onNetworkChange(undefined)
}

const signMessage = async () => {
  if (!props.signClient || !props.session) return
  await props.signClient.request({
    topic: props.session.topic,
    chainId: 'eip155:1',
    request: {
      method: 'personal_sign',
      params: [
        '0x7468697320697320612074657374206d65737361676520746f206265207369676e6564',
        props.account
      ]
    }
  })
}

const connect = async () => {
  if (!props.signClient) return
  const { uri, approval } = await props.signClient.connect({
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

  if (uri) {
    const appKitModal = initializeModal()
    appKitModal.open({ uri })
    const session = await approval()
    props.onAccountChange(session?.namespaces['eip155']?.accounts?.[0]?.split(':')[2])
    props.onNetworkChange(session?.namespaces['eip155']?.chains?.[0])
    props.onSessionChange(session)
    appKitModal.close()
  }
}
</script>
