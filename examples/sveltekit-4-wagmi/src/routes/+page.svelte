<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { modal } from '$lib/appkit';
	import { mainnet, polygon } from '@reown/appkit/networks';
	import { accountState, networkState, appKitState, themeState, events, walletInfo } from '$lib/store';

	import ActionButton from '$lib/components/ActionButton.svelte';
	import InfoList from '$lib/components/InfoList.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// Only update theme in browser
	$: if (browser) {
		document.documentElement.setAttribute('data-theme', $themeState.themeMode);
	}

	let mounted = false;

	onMount(() => {
		mounted = true;

		if (!modal) return;

		// Set initial theme in browser
		if (browser) {
			document.documentElement.setAttribute('data-theme', $themeState.themeMode);
			document.body.className = $themeState.themeMode;
		}

		// Subscribe to all state changes
		modal.subscribeAccount((state) => {
			$accountState = state;
		});

		modal.subscribeNetwork((state) => {
			$networkState = state;
		});

		modal.subscribeState((state) => {
			$appKitState = state;
		});

		modal.subscribeTheme((state) => {
			$themeState = state;
			if (browser) {
				document.documentElement.setAttribute('data-theme', state.themeMode);
				document.body.className = state.themeMode;
			}
		});

		modal.subscribeEvents((state) => {
			$events = state;
		});

		modal.subscribeWalletInfo((state) => {
			$walletInfo = state;
		});
	});

	function toggleTheme() {
		const newTheme = $themeState.themeMode === 'dark' ? 'light' : 'dark';
		modal?.setThemeMode(newTheme);
		$themeState = { ...$themeState, themeMode: newTheme };
		if (browser) {
			document.documentElement.setAttribute('data-theme', newTheme);
			document.body.className = newTheme;
		}
	}

	function switchNetwork() {
		const currentChainId = $networkState?.chainId;
		modal?.switchNetwork(currentChainId === polygon.id ? mainnet : polygon);
	}
</script>

<div class="page-container" data-theme={$themeState.themeMode}>
	<div class="logo-container">
		<img
			src={$themeState.themeMode === 'dark' ? '/reown-logo-white.png' : '/reown-logo.png'}
			alt="Reown"
			width="150"
		/>
		<img src="/appkit-logo.png" alt="AppKit" width="150" />
	</div>

	<h1 class="page-title">SvelteKit 4 Wagmi Example</h1>

	<div class="appkit-buttons-container">
		<appkit-button />
		<appkit-network-button />
	</div>

	<ActionButton />
	<InfoList />
	<Footer />
</div>

{#if mounted && browser}
	<!-- Your existing page content -->
{/if}
