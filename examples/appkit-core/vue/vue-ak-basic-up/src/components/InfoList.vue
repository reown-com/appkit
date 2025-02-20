<template>
  <div class="code-container-wrapper">
    <section class="code-container">
      <h2 class="code-container-title">Account</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(account, null, 2) }}</pre>
      </div>
    </section>

    <section class="code-container">
      <h2 class="code-container-title">Network</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(network, null, 2) }}</pre>
      </div>
    </section>

    <section class="code-container">
      <h2 class="code-container-title">Session</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(session, null, 2) }}</pre>
      </div>
    </section>

    <section class="code-container">
      <h2 class="code-container-title">Balance</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(balance, null, 2) }}</pre>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
interface Props {
  account?: string
  network?: string
  session: unknown
  balance?: string
}

defineProps<Props>()
</script>
