<Input
  block
  large
  label={message.id || location.origin + '/'}
  on:input={(e) => (id = e.detail)}
  value={id}
  on:enter={() => router.go('search', id)}
  invalid={message.id}
>
  <div>
    <Button
      on:click={() => router.go('search') || (id = "")}
      hidden={!id}
      label="X"
      clean
      large
    />
    <Button
      on:click={() => router.go('search', id)}
      disabled={!id}
      label="Search"
      large
    />
  </div>
</Input>

<Slider>
  <table>
    <tr>
      <th>Link</th>
      <th>To</th>
      <th></th>
    </tr>
    {#each found as link}
      <tr>
        <td>
          <a href="/{link.id}" target="_blank">
            {location.origin}/{link.id}
          </a>
        </td>
        <td>
          {link.url}
        </td>
        <td>
          <BtnGroup center block>
            <Button
              on:click={() => copy(link.id)}
              label="Copy"
              clean
              small
            />
            <Button
              on:click={() => router.go("edit", link.id)}
              label="Edit"
              clean
              small
            />
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

  let id = $router.param || ""
  let mail = ""
  let message = {}
  let interval = null

  $: found = !$router.param
    ? Object.values($links)
    : [$links[id] || {}]

  const copy = id => {
    const url = location.origin + '/' + id
    navigator.clipboard.writeText(url)
  }

  /*const submit = async () => {
    if (!url) return

    const data = { url, mail: mail || undefined }

    const res = await fetch("/create", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    if (res.status === 400) {
      message = await res.json()
    }
    else if (res.status === 200) {
      const link = await res.json()
      links.add(link)
      location.hash = "success?" + link.id
    }
    else {
      message = {message: 'Something went wrong, try again later'}
    }

    clearInterval(interval)
    interval = setInterval(() => (message = {}), 10000)
  }*/
</script>

<style>
  :global(.small:not(#hack)) {
    min-height: auto;
  }
  table {
    margin: 2rem auto 0;
  }
  th {
    text-align: left;
    background-color: var(--common-background-color-light);
  }
  td, th {
    padding: 0.5rem 1rem;
  }
  tr:nth-child(odd) {
    background-color: var(--common-background-color-lighten);
  }
</style>
