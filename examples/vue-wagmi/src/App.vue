<template>
  <div class="container">
    <h1>Hello Vue Wagmi</h1>
    <p>Project ID: {{ projectId }}</p>
  </div>
</template>

<script lang="ts" setup>
const projectId = import.meta.env.VITE_PROJECT_ID
</script>

<style>
.container {
  padding: 20px;
}
</style>
