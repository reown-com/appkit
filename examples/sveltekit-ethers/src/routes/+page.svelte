<script lang="ts">
	import { onMount } from 'svelte';
	import { modal } from '$lib/appkit';
	import { mainnet, polygon, base } from '@reown/appkit/networks';

	let accountState = {};
	let networkState = {};
	let appKitState = {};
	let themeState = { themeMode: 'light', themeVariables: {} };
	let events = [];
	let walletInfo = {};

	onMount(() => {
		if (!modal) return;

		// Set initial theme
		document.body.className = themeState.themeMode;

		// Subscribe to all state changes
		modal.subscribeAccount((state) => {
			accountState = state;
		});

		modal.subscribeNetwork((state) => {
			networkState = state;
		});

		modal.subscribeState((state) => {
			appKitState = state;
		});

		modal.subscribeTheme((state) => {
			themeState = state;
			document.body.className = state.themeMode;
		});

		modal.subscribeEvents((state) => {
			events = state;
		});

		modal.subscribeWalletInfo((state) => {
			walletInfo = state;
		});
	});

	function toggleTheme() {
		const newTheme = themeState.themeMode === 'dark' ? 'light' : 'dark';
		modal?.setThemeMode(newTheme);
		themeState = { ...themeState, themeMode: newTheme };
	}

	function switchNetwork() {
		const currentChainId = networkState?.chainId;
		modal?.switchNetwork(currentChainId === polygon.id ? mainnet : polygon);
	}
</script>

<div class="container">
	<h1>SvelteKit Ethers Example</h1>

	<!-- AppKit UI Components -->
	<div class="button-group">
		<appkit-button />
		<appkit-network-button />
	</div>

	<!-- Modal Controls -->
	<div class="button-group">
		<button on:click={() => modal?.open()}>Open Connect Modal</button>
		<button on:click={() => modal?.open({ view: 'Networks' })}>Open Network Modal</button>
		<button on:click={toggleTheme}>Toggle Theme Mode</button>
		<button on:click={switchNetwork}>
			Switch to {networkState?.chainId === polygon.id ? 'Mainnet' : 'Polygon'}
		</button>
	</div>

	<!-- State Displays -->
	<div class="state-container">
		<section>
			<h2>Account</h2>
			<pre>{JSON.stringify(accountState, null, 2)}</pre>
		</section>

		<section>
			<h2>Network</h2>
			<pre>{JSON.stringify(networkState, null, 2)}</pre>
		</section>

		<section>
			<h2>Modal State</h2>
			<pre>{JSON.stringify(appKitState, null, 2)}</pre>
		</section>

		<section>
			<h2>Theme</h2>
			<pre>{JSON.stringify(themeState, null, 2)}</pre>
		</section>

		<section>
			<h2>Events</h2>
			<pre>{JSON.stringify(events, null, 2)}</pre>
		</section>

		<section>
			<h2>Wallet Info</h2>
			<pre>{JSON.stringify(walletInfo, null, 2)}</pre>
		</section>
	</div>
</div>

<style>
	/* Base styles */
	:global(body) {
		margin: 0;
		min-height: 100vh;
		transition:
			background-color 0.3s,
			color 0.3s;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	/* Theme styles */
	:global(body.dark) {
		background-color: #333;
		color: #fff;
	}

	:global(body.light) {
		background-color: #fff;
		color: #000;
	}

	/* Layout */
	.container {
		padding: 20px;
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Typography */
	h1 {
		font-weight: 700;
		font-size: 2.5rem;
		margin-bottom: 1.5rem;
		letter-spacing: -0.02em;
	}

	h2 {
		font-weight: 600;
		font-size: 1.125rem;
		margin: 0 0 10px 0;
		letter-spacing: -0.01em;
	}

	/* Buttons */
	.button-group {
		display: flex;
		gap: 16px;
		margin: 20px 0;
	}

	button {
		padding: 8px 16px;
		border-radius: 6px;
		border: 1px solid #ddd;
		cursor: pointer;
		transition: all 0.3s;
		font-weight: 500;
		font-size: 0.875rem;
	}

	/* Light theme button styles */
	:global(body.light) button {
		background: white;
		color: black;
		border-color: #ddd;
	}

	:global(body.light) button:hover {
		background: #f5f5f5;
	}

	/* Dark theme button styles */
	:global(body.dark) button {
		background: #444;
		color: white;
		border-color: #666;
	}

	:global(body.dark) button:hover {
		background: #555;
	}

	/* State container */
	.state-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
		margin-top: 20px;
	}

	section {
		background: rgba(0, 0, 0, 0.1);
		padding: 16px;
		border-radius: 8px;
		max-height: 300px;
		overflow-y: auto;
	}

	pre {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-all;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono',
			'Source Code Pro', monospace;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>
