<Container small scrollx>
  <Input
    block
    label={message.url || location.origin + '/'}
    on:input={(e) => (url = e.detail)}
    value={url}
    on:enter={() => submit()}
    invalid={message.url}
  >
    <Button
      on:click={() => submit()}
      disabled={!url}
      label="Search"
      center
    />
  </Input>
</Container>

<script>
  import { Input, Container, Button } from 'forui'
  import links from './stores/links.js'

  let url = ""
  let mail = ""
  let message = {}
  let interval = null

  const submit = async () => {
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
  }
</script>

<style>
  :global(.block) {
    margin-bottom: 1.1rem;
  }
</style>
