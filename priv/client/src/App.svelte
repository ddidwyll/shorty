<svelte:head>
  <title>
    shorty / {$router.action || "add"}{$router.param ? " / " + $router.param : ''}
  </title>
</svelte:head>

<Header>
  <h1 on:click={() => router.go()} class:wait={$wait}>
    {$router.action || 'Shorty'}
  </h1>
  <Nav />
</Header>

<Main>
  {#if $router.action === "edit"}
    <Edit />
  {:else if $router.action === "search"}
    <Search />
  {:else if $router.action === "help"}
    <Help />
  {:else}
    <Create />
  {/if}
</Main>

<script>
  import { Header, Main } from 'forui'
  import Create from './Create.svelte'
  import Search from './Search.svelte'
  import Edit from './Edit.svelte'
  import Help from './Help.svelte'
  import Nav from './Nav.svelte'

  import router, { wait } from './stores/router.js'
</script>

<style>
  :global(html:not(#hack)) {
    --common-background-image: none;
  }
  h1 {
    text-transform: capitalize;
  }
  h1.wait {
    animation: 1s pulse 1s infinite;
  }
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
</style>
