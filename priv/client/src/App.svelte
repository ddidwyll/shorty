<svelte:head>
  <title>shorty / {$router.action || "add"}{$router.param ? " / " + $router.param : ''}</title>
</svelte:head>

<Header>
  <h1 on:click={() => router.go()}>
    {$router.action || 'Shorty'}
  </h1>
  <BtnGroup right>
    <Button
      on:click={() => router.go()}
      label="Add"
      disabled={!$router.action}
      clean
    />
    <Button
      on:click={() => router.go("search")}
      label="Search"
      disabled={$router.action === "search"}
      clean
    />
    <Button
      on:click={() => router.go("help")}
      label="Help"
      disabled={$router.action === "help"}
      clean
    />
  </BtnGroup>
</Header>

<Main>
  {#if !$router.action}
    <Create />
  {:else if $router.action === "edit"}
    <Edit />
  {:else if $router.action === "search"}
    <Search />
  {:else if $router.action === "help"}
    <Help />
  {/if}
</Main>

<script>
  import { Header, Main, Button, BtnGroup } from 'forui'
  import Create from './Create.svelte'
  import Search from './Search.svelte'
  import Edit from './Edit.svelte'
  import Help from './Help.svelte'
  import router from './stores/router.js'
</script>

<style>
  :global(html:not(#hack)) {
    --common-background-image: none;
  }
  h1 {
    text-transform: capitalize;
  }
</style>
