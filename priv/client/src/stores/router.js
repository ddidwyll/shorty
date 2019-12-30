import { writable } from 'svelte/store';

const current = () => {
  const [action, param] = location.hash.slice(1).split('?')

  return { action, param }
}

const go = (action, param) => {
  let hash = action || ""
  if (param) hash += '?' + param
  location.hash = hash
}

const error = (key, code) => {
  const json = {}
  json[key] = 'Server not response (correctly)'
  return {
    status: code,
    json: () => json
  }
}

const hash = writable(current())
const busy = writable(false)

window.addEventListener("hashchange", () => hash.set(current()))

const post = async (to, data) => {
  busy.set('send')

  const res = await fetch(to, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).catch(() => error('message', 400))

  busy.set(false)
  return res
}

const search = async (id) => {
  busy.set('fetch')

  const res = await fetch('/get/' + id)
    .catch(() => error('id', 404))

  busy.set(false)
  return res
}

export const wait = {
  subscribe: busy.subscribe
}

export default {
  subscribe: hash.subscribe,
  search,
  go,
  post
}
