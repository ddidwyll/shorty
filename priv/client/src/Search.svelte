<Slider>
  <table>
    <tr>
      <th colspan="3">
        <Input
          block
          large
          label={message.id || origin + ($router.param || '')}
          on:input={(e) => router.go('search', e.detail)}
          value={$router.param || ''}
          on:enter={() => find()}
          invalid={message.id}
          valid={found && found.id == $router.param}
          filter={/[^a-zA-Z0-9-_]+/g}
          max="15"
        >
          <div>
            <Button
              on:click={() => router.go('search')}
              hidden={!$router.param}
              label="All links"
              clean
              large
            >
              x
            </Button>
            <Button
              on:click={() => router.go('search', paste)}
              hidden={!paste || $router.param}
              label="< {paste}"
              clean
              large
            >
              paste
            </Button>
            <Button
              on:click={() => find()}
              disabled={!$router.param}
              label={message.id ? 'Not found' : 'Search'}
              danger={message.id}
              success={found && found.id == $router.param}
              large
            />
          </div>
        </Input>
      </th>
    </tr>
    <tr>
      <th>Link</th>
      <th>To</th>
      <th></th>
    </tr>
    {#each links_list as link}
      <tr>
        <td>
          <a href="/{link.id}" target="_blank">
            {location.origin}/{link.id}
          </a>
        </td>
        <td>
          <span>{link.url}</span>
        </td>
        <td>
          <BtnGroup
            right
            block
          >
          {#if link.confirmed !== false}
            <Button
              on:click={() => clipboard.copy(origin + link.id)}
              label="Copy"
              clean
              small
            />
            <Button
              on:click={() => edit(link.id)}
              label="Edit"
              hidden={!(link.token || link.shadow)}
              clean
              small
            />
            <Button
              on:click={() => links.del(link.id)}
              label="Hide"
              hidden={!$links[link.id]}
              clean
              small
            >x</Button>
          {:else}
            <Button
              label="Uncofirmed"
              disabled
              clean
              small
            />
          {/if}
          </BtnGroup>
        </td>
      </tr>
    {/each}
  </table>
</Slider>

<script>
  import { Input, Container, Button, BtnGroup, Slider } from 'forui'
  import clipboard from './stores/clipboard.js'
  import request from './stores/request.js'
  import router from './stores/router.js'
  import links from './stores/links.js'
  import { onMount } from 'svelte'

  let id = $router.param || ''
  let mail = ''
  let message = {}
  let interval = null
  let found = null

  const origin = location.origin + '/'

  $: links_list = !$router.param
    ? Object.values($links)
    : found && $router.param == found.id
      ? [found]
      : []

  const find = async () => {
    if (!$router.param) return

    if ($links[$router.param]) {
      return found = $links[$router.param]
    }
    
    const res = await fetch('/get/' + $router.param)

    if (res.status == 404) {
      message = await res.json()
      clearInterval(interval)
      interval = setInterval(() => (message = {}), 2000)
    } else if (res.status == 200) {
      found = await res.json()
    }
  }

  onMount(() => find())

  $: paste = $clipboard
    .replace(origin, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '')

  const edit = id => {
    const link = found && found.id === id
      ? found
      : $links[id]

    if (!link) return

    request.set({ link })
    router.go('edit', id)
  }
</script>

<style>
  table {
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  th {
    text-align: left;
  }
  td, th {
    padding: 0.6rem 1.2rem;
  }
  tr {
    border: 1px solid #ddd;
  }
  tr:first-child > th {
    padding: 1.2rem;
  }
  tr:nth-child(odd) {
    background-color: var(--common-background-color-lighten);
  }
  span {
    display: inline-block;
    max-width: 36vw;
    white-space: nowrap;
    overflow: hidden;
  }
</style>
