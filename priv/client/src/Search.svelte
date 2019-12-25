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
</script>

<style>
  table {
    margin: 1.5rem auto 0;
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
  tr:nth-child(odd) {
    background-color: var(--common-background-color-lighten);
  }
</style>
