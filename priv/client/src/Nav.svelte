<BtnGroup right>
  <Button
    on:click={() => router.go()}
    label="Add"
    disabled={!$router.action}
    clean
  />
  <Button
    on:click={() => router.go('search')}
    label="Search"
    disabled={$router.action === 'search'}
    clean
  />
  {#if $request.id && $request.link && $request.link.id}
    <Button
      on:click={() => router.go('edit', $request.link.id)}
      label="Confirm"
      disabled={$router.action === 'edit'}
      clean
    />
  {/if}
  <Button
    on:click={() => router.go("help")}
    label="Help"
    disabled={$router.action === 'help'}
    clean
  />
</BtnGroup>

<script>
  import { Button, BtnGroup } from 'forui'

  import router from './stores/router.js'
  import request from './stores/request.js'
</script>
