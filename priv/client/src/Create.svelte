<Container small middle>
  <h2>Welcome! Ready to get started?</h2>
  <h4>No registration, no ads, no logs, no fee.</h4>
  <Input
    block
    large
    label={message.url || "Enter URL you want to shorten, e.g. http://example.com"}
    on:input={(e) => (url = e.detail)}
    value={url}
    on:enter={() => submit()}
    invalid={message.url}
  >
    <Button
      on:click={() => (url = "")}
      hidden={!url}
      label="X"
      large
    />
  </Input>
  <Input
    block
    large
    label={message.mail || "You can specify your email, to edit this link in future"}
    on:input={(e) => (mail = e.detail)}
    value={mail}
    hints={emails()}
    on:enter={() => submit()}
    invalid={message.mail}
  >
    <Button
      on:click={() => (mail = "")}
      hidden={!mail}
      label="X"
      large
    />
  </Input>
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
  import router from './stores/router.js'
  import links from './stores/links.js'
  import { onMount } from 'svelte'

  let url = ""
  let mail = ""
  let message = {}
  let interval = null

  onMount(async () => {
    const clipboard = await navigator.clipboard.readText()
    if (clipboard.startsWith('http')) {
      url = clipboard
    }
  })

  const emails = () => {
    const arr = Object.values($links).map(l => l.mail).filter(m => m)
    return [...new Set(arr)]
  }

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
  :global(.small > .block), h2, h4 {
    margin-bottom: 1.3rem;
    font-weight: 400;
    text-align: center;
  }
</style>
