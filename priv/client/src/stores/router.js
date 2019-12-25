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

const { subscribe, set } = writable(current())

window.addEventListener("hashchange", () => set(current()))

export default { subscribe, go }
