<script lang="ts">
	import { onMount } from 'svelte';
	import { modal } from '../lib/appkit';

	let accountState = {};
	let networkState = {};

	onMount(() => {
		let walletProviderType = '';
		let providerInfo = {};

		onMount(() => {
			if (!modal) return;

			modal?.subscribeAccount((state) => {
				accountState = state;
			});

			modal?.subscribeNetwork((state) => {
				networkState = state;
			});

			return () => {};
		});

		function openModal() {
			modal?.open();
		}

		function openNetworks() {
			modal?.open({ view: 'Networks' });
		}
	});
</script>

<main>
	<h1>SvelteKit Ethers Example</h1>

	<div class="button-group">
		<button on:click={modal?.open}>Open Modal</button>
		<button on:click={modal?.open({ view: 'Networks' })}>Open Networks</button>
		<appkit-button />
		<appkit-network-button />
	</div>
</main>

<style>
	main {
		padding: 1rem;
	}

	h1 {
		margin-bottom: 2rem;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		background: #3898ff;
		color: white;
		cursor: pointer;
	}

	button:hover {
		background: #1f7fef;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	.info-item {
		background: #1a1a1a;
		padding: 1rem;
		border-radius: 8px;
	}

	h3 {
		margin-bottom: 0.5rem;
	}

	pre {
		background: #2a2a2a;
		padding: 0.5rem;
		border-radius: 4px;
		overflow-x: auto;
	}
</style>
