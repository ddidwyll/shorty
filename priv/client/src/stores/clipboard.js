import { writable } from 'svelte/store';

const { subscribe, set } = writable('')

const refresh = async () => {
  set(await navigator.clipboard.readText() || '')
}

const copy = async (text) => {
  await navigator.clipboard.writeText(text)
  refresh()
}

window.addEventListener("focus", () => refresh())
window.addEventListener("copy", () => refresh())

refresh()

export default { subscribe, refresh, copy }
