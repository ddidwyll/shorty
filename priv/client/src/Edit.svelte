<Container small scrollx>
  <Input
    block
    large
    label="Link to"
    value={link.url}
    disabled
  />
  <Input
    block
    label={message.id || location.origin + '/' + (id || link.id)}
    on:input={(e) => (id = e.detail)}
    invalid={message.id}
    value={$request.id || id}
    disabled={$request.id}
    filter={/[^a-zA-Z0-9-_]+/g}
    max="15"
    large
  />
  <Input
    block
    type="email"
    label={message.mail || 'Email ' + link.shadow}
    on:input={(e) => (mail = e.detail)}
    value={$request.mail || mail}
    invalid={message.mail}
    disabled={$request.id}
    hidden={!link.shadow}
    hints={$emails}
    large
  />
  {#if $request.id}
    <Input
      block
      label={message.token || 'Verification code from email'}
      on:input={(e) => (token = e.detail)}
      value={token}
      invalid={message.token}
      filter={/[^a-zA-Z0-9]+/g}
      max="7"
      large
    >
      <Button
        on:click={() => (token = $clipboard)}
        hidden={token || !$clipboard || $clipboard.replace(/[^a-zA-Z0-9]+/g, '').length !== 7}
        label="< {$clipboard}"
        clean
        large
      >
        paste
      </Button>
    </Input>
  {/if}
  <BtnGroup block gutter>
    <Button
      label="Cancel"
      on:click={() => cancel()}
      disabled={$wait}
      danger
      width
      center
      large
    />
    {#if $request.id}
      <Button
        label={$wait || 'Confirm'}
        on:click={() => confirm()}
        disabled={!token || token.length !== 7 || $wait}
        width
        center
        large
      />
    {:else}
      <Button
        label={$wait || hasToken ? 'Change' : 'Request change'}
        on:click={() => submit()}
        disabled={!id || id === link.id || (!hasToken && !mail) || $wait}
        width
        center
        large
      />
    {/if}
  </BtnGroup>
  <p hidden={!message.message && !message.token}>
    {message.message || message.token}
  </p>
</Container>

<script>
  import { Input, Container, Button, BtnGroup } from 'forui'
  import router, { wait } from './stores/router.js'
  import links, { emails } from './stores/links.js'
  import clipboard from './stores/clipboard.js'
  import request from './stores/request.js'

  $: link = $request
    ? $request.link || {}
    : {}

  $: hasToken = !!link.token

  let id = ''
  let mail = ''
  let token = ''
  let message = {}
  let interval = null

  const submit = async () => {
    if (!id) return

    const data = hasToken
      ? { old: link.id, id, token: link.token }
      : { old: link.id, id, mail }

    const to = hasToken ? '/change' : '/request'
    const res = await router.post(to, data)

    if (res.status === 400) {
      message = await res.json()
    }
    else if (res.status === 200) {
      if (hasToken) {
        update(await res.json())
      } else {
        message = await res.json()
        request.pending(id, mail)
      }
    }
    else {
      message = { message: 'Something went wrong, try again later' }
    }

    clearInterval(interval)
    interval = setInterval(() => (message = {}), 10000)
  }

  const confirm = async () => {
    if (!token || token.length !== 7) return

    const res = await router.post('/confirm', { token })

    if (res.status === 400) {
      message = await res.json()
    }
    else if (res.status === 200) {
      update(await res.json())
    }
    else {
      message = { message: 'Something went wrong, try again later' }
    }

    clearInterval(interval)
    interval = setInterval(() => (message = {}), 10000)
  }

  const update = new_link => {
    links.add(new_link)
    links.del(link.id)
    cancel(new_link.id)
  }

  const cancel = id => {
    request.set({})
    router.go('search', id || $router.param)
  }
</script>
