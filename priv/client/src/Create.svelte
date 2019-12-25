<Container small scrollx>
  <Input
    block
    large
    label={message.url || "Enter URL you want to shorten, e.g. http://example.com"}
    on:input={(e) => (url = e.detail)}
    value={url}
    on:enter={() => submit()}
    invalid={message.url}
  />
  <Input
    block
    large
    label={message.mail || "You can specify your email, to edit this link in future"}
    on:input={(e) => (mail = e.detail)}
    value={mail}
    on:enter={() => submit()}
    invalid={message.mail}
  />
  <Button
    on:click={() => submit()}
    disabled={!url}
    large
    label={url ? 'Let\'s shorten' : 'URL required'}
    width
    center
  />
  <p hidden={!message.message}>
    {message.message}
  </p>
</Container>

<script>
  import { Input, Container, Button } from 'forui'
  import links from './stores/links.js'
  import router from './stores/router.js'

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
      router.go("search", link.id)
    }
    else {
      message = {message: 'Something went wrong, try again later'}
    }

    clearInterval(interval)
    interval = setInterval(() => (message = {}), 10000)
  }
</script>

<style>
  :global(.small > .block) {
    margin-bottom: 1.1rem;
  }
</style>
