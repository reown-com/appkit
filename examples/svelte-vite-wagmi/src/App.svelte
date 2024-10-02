<script lang="ts">
  import { onMount } from 'svelte';
  import { initializeWeb3Modal } from './config'
 
 

  onMount(  () => {
    initializeWeb3Modal()
     
 
  });
</script> 

<main>
  
  <h1>Vite + Svelte</h1>

 

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    Click on the Vite and Svelte logos to learn more
  </p>
  <w3m-button/>
</main>

 