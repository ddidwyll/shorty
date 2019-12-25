import { persist } from 'svelte-persist'

const { subscribe, update } = persist('myLinks', {})

const add = link =>
  update(links => {
    links[link.id] = link
    return { ...links }
  })

const del = id =>
  update(links => {
    delete links[id]
    return { ...links }
  })

export default {
  subscribe,
  add,
  del
}
