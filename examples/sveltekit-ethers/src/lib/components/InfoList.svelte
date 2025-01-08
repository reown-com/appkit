<script lang="ts">
  import { accountState, networkState, appKitState, themeState, events, walletInfo } from '$lib/store';
</script>

<div class="code-container-wrapper">
  <section class="code-container">
    <h2 class="code-container-title">useAppKitAccount()</h2>
    <div class="code-container-content">
      <pre>{JSON.stringify($accountState, null, 2)}</pre>
    </div>
  </section>

  <section class="code-container">
    <h2 class="code-container-title">useAppKitNetwork()</h2>
    <div class="code-container-content">
      <pre>{JSON.stringify($networkState, null, 2)}</pre>
    </div>
  </section>

  <section class="code-container">
    <h2 class="code-container-title">useAppKitTheme()</h2>
    <div class="code-container-content">
      <pre>{JSON.stringify($themeState, null, 2)}</pre>
    </div>
  </section>

  <section class="code-container">
    <h2 class="code-container-title">useAppKitState()</h2>
    <div class="code-container-content">
      <pre>{JSON.stringify($appKitState, null, 2)}</pre>
    </div>
  </section>

  <section class="code-container">
    <h2 class="code-container-title">useAppKitEvents()</h2>
    <div class="code-container-content">
      <pre>{JSON.stringify($events, null, 2)}</pre>
    </div>
  </section>

  <section class="code-container">
    <h2 class="code-container-title">useWalletInfo()</h2>
    <div class="code-container-content">
      <pre>{JSON.stringify($walletInfo, null, 2)}</pre>
    </div>
  </section>
</div>