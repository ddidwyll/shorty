<Slider>
  <table>
    <tr>
      <th colspan="3">
        <Input
          block
          large
          label={message.id || location.origin + '/' + ($router.param || '')}
          on:input={(e) => search(e)}
          value={$router.param || ''}
          on:enter={() => find()}
          invalid={message.id}
          valid={found && found.id == $router.param}
        >
          <div>
            <Button
              on:click={() => router.go('search')}
              hidden={!$router.param}
              label="All"
              clean
              large
            >
            x
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
          <BtnGroup right block>
            <Button
              on:click={() => copy(link.id)}
              label="Copy"
              clean
              small
            />
            <Button
              on:click={() => router.go("edit", link.id)}
              label="Edit"
              hidden={!$links[link.id] && !link.shadow}
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
          </BtnGroup>
        </td>
      </tr>
    {/each}
  </table>
</Slider>

<script>
  import { Input, Container, Button, BtnGroup, Slider } from 'forui'
  import router from './stores/router.js'
  import links from './stores/links.js'
  import { onMount } from 'svelte'

  let id = $router.param || ""
  let mail = ""
  let message = {}
  let interval = null
  let found = null

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

  const search = e => {
    const origin = location.origin + '/'
    const id = e.detail.replace(origin, "")
    router.go('search', id)
  }

  const copy = id => {
    const url = location.origin + '/' + id
    navigator.clipboard.writeText(url)
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
