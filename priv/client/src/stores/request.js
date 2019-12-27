import { persist } from 'svelte-persist'

const { subscribe, update, set } = persist('request', {})

const pending = (id, mail) => update(request => ({ ...request, id, mail }))

export default {
  subscribe,
  pending,
  set
}
