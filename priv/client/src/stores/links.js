import { persist } from 'svelte-persist'
import { derived } from 'svelte/store'

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

export const emails = derived({ subscribe }, $links => {
  const arr = Object.values($links)
    .map(l => l.mail)
    .filter(m => m)
  return [...new Set(arr)]
})

export default { subscribe, add, del }
